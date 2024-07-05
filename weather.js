const puppeteer = require('puppeteer')
const Jimp = require('jimp')

async function twoHourForecast(location) {
    try {
        const browser = await puppeteer.launch({ headless: "new" })
        const page = await browser.newPage()

        await page.goto('https://www.nea.gov.sg/weather')
        await page.waitForSelector(`.weather-grid`)
        await page.waitForSelector(`#${location}`)

        const forecastText = await page.$eval(`#${location}`, element => element.getAttribute('title'))
        const forecastParts = forecastText.split('\n')
        const forecast = forecastParts[1]

        await browser.close()
        return forecast
    } catch (error) {
        throw new Error('Failed to scrape 2-hour forecast')
    }
}

async function twentyfourHourForecast(area) {
    try {
        const browser = await puppeteer.launch({ headless: "new" })
        const page = await browser.newPage()

        await page.goto('https://www.nea.gov.sg/weather')
        await page.waitForSelector('.weather-grid.area-grid.is-active')

        // Values wanted from active time slots 'data-day', fitted into array
        const activeTimeSlot = await page.$eval('.weather-grid.area-grid.is-active', element => element.getAttribute('data-day'))
        const times = ['night', 'morn', 'afternoon']

        let startingIndex = times.indexOf(activeTimeSlot)
        const currentTime = new Date()

        if (currentTime.getHours() >= 18 || currentTime.getHours() < 6) {
            startingIndex = times.indexOf('night')
        } else if (currentTime.getHours() >= 12) {
            startingIndex = times.indexOf('afternoon')
        } else if (currentTime.getHours() >= 6) {
            startingIndex = times.indexOf('morn')
        }

        const forecasts = {}
        // Loop through the times array and get the forecasts for that timing, then return to user
        for (let i = 0; i < times.length; i++) {
            const time = times[(startingIndex + i) % times.length]
            const forecastElement = await page.$(`#weather-grid-${time} .${area}`)
            
            if (forecastElement) {
                const forecast = await forecastElement.evaluate(element => element.getAttribute('title'))
                forecasts[time] = forecast
            }
        }

        await browser.close()
        return forecasts

    } catch (error) {
        throw new Error('Failed to scrape 24-hour forecast')
    }
}

async function rainMapping() {
    try {
        const browser = await puppeteer.launch({ headless: "new" })
        const page = await browser.newPage()
    
        await page.goto('https://www.nea.gov.sg/weather')
        const rainURL = await page.$eval('.rain-map-rain-overlay', img => img.src)
        const baseMap = await Jimp.read('https://www.nea.gov.sg/assets/images/map/base-853.png')
        const rainArea = await Jimp.read(rainURL)
        rainArea.resize(baseMap.getWidth(), baseMap.getHeight())
        baseMap.composite(rainArea, 0, 0)
        const outputImgPath = 'rain_area_overlay_img.png'
        await baseMap.writeAsync(outputImgPath)
        
        await browser.close()
        return outputImgPath
    } catch (error) {
        throw new Error('Failed to scrape rain area mapping')
    }
}

async function UVindex() {
    try {
        const browser = await puppeteer.launch({ headless: "new" })
        const page = await browser.newPage()
    
        await page.goto('https://www.nea.gov.sg/weather')
        await page.waitForSelector('.uv-current-reading')

        const level = await page.$eval('.circle__container span', (element) => element.textContent.trim())
        const rating = await page.$eval('.uv-current-reading .text', (element) => element.textContent.trim())
        const time = await page.$eval('.latest-hour', (element) => element.textContent.trim())

        await browser.close()
        return {level, rating, time}
    } catch (error) {
        throw new Error('Failed to scrape uv index')
    }
}

module.exports = {
    twoHourForecast, twentyfourHourForecast, rainMapping, UVindex
}