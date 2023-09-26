const puppeteer = require('puppeteer')
const axios = require('axios')

async function getNearbyBusstop(startingLocation) {
    try {
        const browser = await puppeteer.launch({ headless: "new", args: ['--incognito'] })
        const page = await browser.newPage()
        await page.setGeolocation({ latitude: 0, longitude: 0 })

        await page.goto(`https://www.google.com/search?q=bus+stop+near+${startingLocation}&tbm=lcl`)
    
        await page.waitForSelector('span.OSrXXb')
        
        const busstopElements = await page.$$('span.OSrXXb')
        const maxElementCount = Math.min(7, busstopElements.length)
        const busstops = []
  
        for (let i = 0; i < maxElementCount; i++) {
            const busstopText = await busstopElements[i].evaluate(element => element.textContent)
            busstops.push({
                busstopText
            })
        }
        await browser.close()
        return busstops
    } catch (error) {
        throw new Error('Failed to get nearby bus stop')
    }
}

async function convertBusstopCode(startingLocation) {
    const response = await axios.get('https://data.busrouter.sg/v1/stops.json')
    const busStopDB = response.data
    try {
        if (/^\d{5}$/.test(startingLocation) && busStopDB.hasOwnProperty(startingLocation)) {
            return startingLocation
        } else {
            for (const busStop in busStopDB) {
                if (busStopDB.hasOwnProperty(busStop)) {
                    const busStopName = busStopDB[busStop][2]
                    if (busStopName === startingLocation) {
                        return busStop
                    }
                }
            }
            return null

        }
    } catch (error) {
        throw new Error('Failed to convert bus stop')
    }
}

async function getBusTimings(busstopName) {
    try {
        const browser = await puppeteer.launch({ headless: "new" })
        const page = await browser.newPage()

        await page.goto(`https://www.sbstransit.com.sg/service/sbs-transit-app?BusStopNo=${busstopName}&ServiceNo=`)
        await page.waitForSelector('.sbs-mobile-app')

        const busTimings = await page.evaluate(() => {
            const formatTiming = (timing) => {
                if (timing === 'Arriving') return 'Arr'
                if (timing === 'Not available') return 'NA'
                return timing
            }
            const timings = []
            const rows = Array.from(document.querySelectorAll('.table.tb-bus tbody tr'))
        
            rows.forEach(row => {
                const columns = row.querySelectorAll('td')
                const busName = columns[0].textContent.trim().split(' - ')[0]
                const nextBusTiming = formatTiming(columns[1].textContent.trim())
                const subsequentBusTiming = formatTiming(columns[2].textContent.trim())
        
                timings.push({
                    busName,
                    nextBusTiming,
                    subsequentBusTiming
                })
            })
            return timings
        })
        await browser.close()
        return busTimings
    } catch (error) {
        throw new Error('Failed to scrape bus timings')
    }
}

module.exports = {
    getNearbyBusstop, convertBusstopCode, getBusTimings
}