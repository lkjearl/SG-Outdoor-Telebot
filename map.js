const puppeteer = require('puppeteer')

async function getStartingAddress(location) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${location.latitude}&lon=${location.longitude}&format=json`
    try {
        const response = await fetch(url)
        const result = await response.json()

        // Extract the address details from the result
        const address = result.address
        const formattedAddress = `${address.road || ''}, ${address.house_number || ''}, ${address.postcode || ''}, ${address.city || ''}, ${address.country || ''}`

        return formattedAddress
    } catch (error) {
        throw new Error('Failed to perform reverse geocoding')
    }
}

async function getDirection(startingLocation, destination) {
    let browser
    try {
        const browser = await puppeteer.launch({ headless: "new", args: ['--incognito'] })
        const page = await browser.newPage()

        await page.goto('https://www.google.com/maps/dir/')

        // Prevent google maps from using overseas location
        const startingLocationMod = `${startingLocation} Singapore`
        const destinationMod = `${destination} Singapore`

        await page.type('#directions-searchbox-0 .tactile-searchbox-input', startingLocationMod)
        await page.type('#directions-searchbox-1 .tactile-searchbox-input', destinationMod)
        await page.click('#directions-searchbox-0 button[data-tooltip="Search"]')
        await page.waitForNavigation()

        const travelMode = ['Driving', 'Motorcycle', 'Public Transport', 'Walking', 'Cycling']
        const travelInfo = []
        
        for (let i = 1; i <= 5; i++) {
            // get landing page url for each transport mode
            await page.waitForSelector(`[jsinstance="${i}"] button[role="radio"]`)
            const transportButton = await page.$(`[jsinstance="${i}"] button[role="radio"]`)
            await transportButton.click()
            await page.waitForNavigation()

            const transportUrl = page.url()
            //get optimal duration for each transport mode
            await page.waitForSelector(`[jsinstance="${i}"] .Fl2iee`)
            const durationElement = await page.$(`[jsinstance="${i}"] .Fl2iee`)
            if (durationElement) {
                const durationText = await durationElement.evaluate(element => element.textContent)

                travelInfo.push({
                    mode: travelMode[i-1],
                    duration: durationText,
                    url: transportUrl
                })
            } else {
                console.log(`Duration element not found for mode ${i}`)
            }
        }
        return travelInfo
    } catch (error) {
        throw new Error('Failed to scrape map direction')
    } finally {
        if (browser) await browser.close()
    }
}

module.exports = {
    getDirection, getStartingAddress
}