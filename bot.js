const { Telegraf, Markup } = require('telegraf')
const { message } = require('telegraf/filters')
const { twoHourForecast, twentyfourHourForecast, rainMapping, UVindex } = require('./weather')
const { getDirection, getStartingAddress } = require('./map')
const { getNearbyBusstop, convertBusstopCode, getBusTimings } = require('./bus')
require('dotenv').config()

// Initialize bot
const bot = new Telegraf(process.env.BOT_TOKEN)

const startText = (ctx) => {
    ctx.telegram.sendMessage(ctx.chat.id, 'Welcome to Outdoor SG bot!', {
        reply_markup: {
            inline_keyboard: [
                [{text: "Check Weather", callback_data: "weather"}],
                [{text: "Check Directions", callback_data: "directions"}],
                [{text: "Check Bus timings", callback_data: "bustiming"}],
            ]
        }
    })
}

// Helper function to handle async message deletion
const deleteMessage = async (ctx) => {
    try {
        await ctx.deleteMessage();
    } catch (error) {
        console.error('Error deleting message:', error);
    }
}

// Area location mapping
const areaLocations = {
    'northside': ["Lim Chu Kang", "Mandai", "Punggol", "Seletar", "Sembawang", "Sengkang", "Sungei Kadut", "Woodlands", "Yishun"],
    'southside': ["Bukit Merah", "City", "Kallang", "Queenstown", "Sentosa", "Southern Island", "Tanglin"],
    'centralside': ["Ang Mo Kio", "Bishan", "Bukit Panjang", "Bukit Timah", "Central Water Catchment", "Novena", "Serangoon", "Toa Payoh"],
    'eastside': ["Bedok", "Changi", "Geylang", "Hougang", "Marine Parade", "Pasir Ris", "Paya Lebar", "Pulau Tekong", "Pulau Ubin", "Tampines"],
    'westside': ["Boon Lay", "Bukit Batok", "Choa Chu Kang", "Clementi", "Jalan Bahar", "Jurong East", "Jurong West", "Pioneer", "Tengah", "Tuas", "Western Island", "Western Water Catchment"]
}

// Area location keyboard
const areaLocationKeyboard = (area) => {
    const locations = areaLocations[area]
    const keyboard = locations.map(location => [{ text: location, callback_data: `location:${area}:${location}` }])
    keyboard.push([{text: "Back", callback_data: "2hours"}])
    return {
        reply_markup: {
            inline_keyboard: keyboard
        }
    }
}

// Start bot
bot.start(async (ctx) => {
    await deleteMessage(ctx);
    startText(ctx);
})

// Redirect to homemenu when user click 'home'
bot.action('home', async (ctx) => {
    await deleteMessage(ctx);
    startText(ctx);
})

// Check weather
bot.action('weather', async (ctx) => {
    await deleteMessage(ctx);
    ctx.telegram.sendMessage(ctx.chat.id, 'Select your option: ',
    {
        reply_markup: {
            inline_keyboard: [
                [{text: "Check 24 hours forecast", callback_data: "24hours"}],
                [{text: "Check 2 hours forecast", callback_data: "2hours"}],
                [{text: "Rain Areas mapping", callback_data: "rainarea"}],
                [{text: "UV index", callback_data: "uvindex"}],
                [{text: "Back to home", callback_data: "home"}]
            ]
        }
    })
})

// Weather 24hour forecast selection
bot.action('24hours', async (ctx) => {
    await deleteMessage(ctx);
    ctx.replyWithMarkdownV2('Check __24hr__ forecast for which area:',
    {
        reply_markup: {
            inline_keyboard: [
                [{text: "North", callback_data: "north"}],
                [{text: "South", callback_data: "south"}],
                [{text: "Central", callback_data: "central"}],
                [{text: "East", callback_data: "east"}],
                [{text: "West", callback_data: "west"}],
                [{text: "Back", callback_data: "weather"}]
            ]
        }
    })
})
// Handle extracted 24hr forecast
bot.action(['north', 'south', 'central', 'east', 'west'], async (ctx) => {
    await deleteMessage(ctx);
    const area = ctx.match[0]
    try {
        const forecast = await twentyfourHourForecast(area)
        let forecastMessage = ''

        for (let timing in forecast) {
            if (timing.time === 'morn') {
                timing.time = 'morning'
                return timing
            }
            forecastMessage += `__${timing.charAt(0).toUpperCase() + timing.slice(1)}__: *${forecast[timing]}*\n`
        }

        ctx.replyWithMarkdownV2(`Forecast for ${area.charAt(0).toUpperCase() + area.slice(1)} area:\n\n${forecastMessage}`, {
            reply_markup: {
                inline_keyboard: [
                    [{text: "Back", callback_data: "weather"}]
                ]
            }
        })
    } catch (error) {
        ctx.replyWithMarkdownV2('Weather site experiencing latency. Please try again later.', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Back', callback_data: 'weather' }]
                ]
            }
        })
    }
})

// Weather 2hr forecast selection
bot.action('2hours', async (ctx) => {
    await deleteMessage(ctx);
    ctx.replyWithMarkdownV2('Check __2hr__ forecast for which area:', {
        reply_markup: {
            inline_keyboard: [
                [{text: "North", callback_data: "northside"}],
                [{text: "South", callback_data: "southside"}],
                [{text: "Central", callback_data: "centralside"}],
                [{text: "East", callback_data: "eastside"}],
                [{text: "West", callback_data: "westside"}],
                [{text: "Back", callback_data: "weather"}]
            ]
        }
    })
})

// Weather 2hr forecast followup keyboard
bot.action(['northside', 'southside', 'centralside', 'eastside', 'westside'], async (ctx) => {
    await deleteMessage(ctx);
    const area = ctx.match[0]
    const keyboardMarkup = areaLocationKeyboard(area)
    // caps first letter and remove 'side' from end of str
    const formattedArea = area.charAt(0).toUpperCase() + area.slice(1, -4);
    ctx.replyWithMarkdownV2(`Which part of *${formattedArea}* area:`, keyboardMarkup)
})

// Handle extracted 2hr forecast
bot.action(/^location:(.+)$/, async (ctx) => {
    await deleteMessage(ctx);
    try {
        const fullLocation = ctx.match[1]
        const parts = fullLocation.split(':')
        const location = parts[1]
        const weather = await twoHourForecast(location.replace(/ /g, '_'))
        ctx.replyWithMarkdownV2(`Current weather in __${location}__: *${weather}*`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Back", callback_data: "weather" }]
                ]
            }
        })
    } catch (error) {
        ctx.replyWithMarkdownV2('Weather site experiencing latency. Please try again later.', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Back', callback_data: 'weather' }]
                ]
            }
        })
    }
})

// Handle rain area selection
bot.action('rainarea', async (ctx) => {
    await deleteMessage(ctx);
    try {
        const rainmap = await rainMapping()
        ctx.replyWithPhoto({ source: rainmap }, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Back", callback_data: "weather" }]
                ]
            }
        })
    } catch (error) {
        ctx.replyWithMarkdownV2('Weather site experiencing latency. Please try again later.', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Back', callback_data: 'weather' }]
                ]
            }
        })
    }
})

// Handle UV index selection
bot.action('uvindex', async (ctx) => {
    await deleteMessage(ctx);
    try {
        const forecast = await UVindex()
        ctx.replyWithMarkdownV2(`Current UV __Index__:\n\nUV Rating: *${forecast.rating}*\nUV Level: *${forecast.level}*\n\nUpdated ${forecast.time}`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Back", callback_data: "weather" }]
                ]
            }
        })
    } catch (error) {
        ctx.replyWithMarkdownV2('Weather site experiencing latency. Please try again later.', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Back', callback_data: 'weather' }]
                ]
            }
        })
    }
})

// Check map directions
// using a variable to make sure user is commiting the interaction
let userChoice = ''
let destination = ''

// Direct user to input destination
bot.action('directions', async (ctx) => {
    await deleteMessage(ctx);
    userChoice = 'directions'
    ctx.replyWithMarkdownV2('Please enter *destination*:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Back to home', callback_data: 'home' }]
            ]
        }
    })
})

// Direct user to input start location
bot.on(message('text'), async (ctx) => {
    await deleteMessage(ctx);
    if (userChoice === 'directions') {
        destination = ctx.message.text
        // reset user choice for next interaction
        userChoice = ''
        ctx.replyWithMarkdownV2('Select option for *starting* location:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'GPS Location', callback_data: 'current_location' }],
                    [{ text: 'Enter Location', callback_data: 'custom_location' }],
                    [{ text: 'Back', callback_data: 'directions' }]
                ]
            }
        })
    } else if (userChoice === 'custom_location') {
        const customStartingLocation = ctx.message.text
        userChoice = ''

        const directionsInfo = await getDirection(customStartingLocation, destination)

        let replyMessage = 'Directions *transport* details:\n'
        const inlineKeyboard = []

        for (const info of directionsInfo) {
            const urlButton = {
                text: `${info.mode} (${info.duration})`,
                url: info.url
            }
            inlineKeyboard.push([urlButton])
        }
        inlineKeyboard.push([{ text: "Back to home", callback_data: "home" }])
        ctx.replyWithMarkdownV2(replyMessage, {
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        })
    } else if (userChoice === 'custom_bustops') {
        const customBusAddress = ctx.message.text
        userChoice = ''

        const nearbyBusstops = await getNearbyBusstop(customBusAddress)

        const inlineKeyboard = []
        const keyboardButtons = nearbyBusstops.map((busstop) => {
                const buttonText = busstop.busstopText
                const callbackData = `Xb0e71mA3qM:?${buttonText}`
                return [{ text: buttonText, callback_data: callbackData }]
        })

        inlineKeyboard.push(...keyboardButtons)
        inlineKeyboard.push([{ text: "Back", callback_data: "busnearby" }])
        ctx.reply('Select a bus stop:', { reply_markup: { inline_keyboard: inlineKeyboard } })

    } else if (userChoice === 'custom_busCode') {
        const customBusAddress = ctx.message.text
        userChoice = ''

        const callbackData = `Xb0e71mA3qM:?${customBusAddress}`
        ctx.telegram.sendMessage(ctx.chat.id, 'Confirm your bus stop Code', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `Confirm ${customBusAddress}`, callback_data: callbackData }],
                    [{ text: 'Back', callback_data: 'buscode' }]
                ]
            }
        })
    }
})

// Handle users current location method
bot.action(['current_location', 'custom_location'], async (ctx) => {
    await deleteMessage(ctx);
    const choice = ctx.match[0]
    if (choice === 'current_location') {
        userChoice = 'current_location'
        ctx.reply('Please share your current location:', {
            reply_markup: {
                keyboard: [
                    [{ text: 'Share My Location', request_location: true }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            }
        })
    } else if (choice === 'custom_location') {
        userChoice = 'custom_location'
        ctx.replyWithMarkdownV2('Please enter *starting* location:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Back', callback_data: 'directions' }]
                ]
            }
        })
    }
})

// Handle extracted directions
bot.on(message('location'), async (ctx) => {
    await deleteMessage(ctx);
    if (userChoice === 'current_location') {
        const unformattedLocation = ctx.message.location
        const startingLocation = await getStartingAddress(unformattedLocation)
        const directionsInfo = await getDirection(startingLocation, destination)

        let replyMessage = 'Directions *transport* details:\n'
        const inlineKeyboard = []

        for (const info of directionsInfo) {
            const urlButton = {
                text: `${info.mode} (${info.duration})`,
                url: info.url
            }
            inlineKeyboard.push([urlButton])
        }
        inlineKeyboard.push([{ text: "Back to home", callback_data: "home" }])
        ctx.replyWithMarkdownV2(replyMessage, {
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        })
    } else if (userChoice === 'current_bustops') {
        const unformattedLocation = ctx.message.location

        const currentBusAddress = await getStartingAddress(unformattedLocation)
        const nearbyBusstops = await getNearbyBusstop(currentBusAddress)
        
        const inlineKeyboard = []
        const keyboardButtons = nearbyBusstops.map((busstop) => {
                const buttonText = busstop.busstopText
                const callbackData = `Xb0e71mA3qM:?${buttonText}`
                return [{ text: buttonText, callback_data: callbackData }]
        })

        inlineKeyboard.push(...keyboardButtons)
        inlineKeyboard.push([{ text: "Back", callback_data: "busnearby" }])
        ctx.reply('Select a bus stop:', { reply_markup: { inline_keyboard: inlineKeyboard } })
    }
    userChoice = ''
})

// Check bus timings
bot.action('bustiming', async (ctx) => {
    await deleteMessage(ctx);
    ctx.telegram.sendMessage(ctx.chat.id, 'Select which service to use:', {
        reply_markup: {
            inline_keyboard: [
                [{text: "Find nearby bus stops timing", callback_data: "busnearby"}],
                [{text: "Find bus timing using bus stop code", callback_data: "buscode"}],
                [{ text: 'Back', callback_data: 'bustiming' }]
            ]
        }
    })
})

// Handle bus stop code via manual input method
bot.action('buscode', async (ctx) => {
    await deleteMessage(ctx);
    userChoice = 'custom_busCode'
    const special_char = ['(', ')']
    const escapeMarkdown = (text) => {
        special_char.forEach(char => (text = text.replaceAll(char, `\\${char}`)))
        return text
    }
    ctx.replyWithMarkdownV2(escapeMarkdown('Search bus timings using bus stop code (5 digit):'), {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Back', callback_data: 'bustiming' }]
            ]
        }
    })
})

// Nearby bus stops discovery method
bot.action('busnearby', async (ctx) => {
    await deleteMessage(ctx);
    ctx.replyWithMarkdownV2('Select option for *starting* location:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'GPS Location', callback_data: 'current_bustops' }],
                [{ text: 'Custom Location', callback_data: 'custom_bustops' }],
                [{ text: 'Back', callback_data: 'bustiming' }]
            ]
        }
    })
})

// Nearby bus stops discovery method follow up
bot.action(['current_bustops', 'custom_bustops'], async (ctx) => {
    await deleteMessage(ctx);
    const choice = ctx.match[0]
    if (choice === 'current_bustops') {
        userChoice = 'current_bustops'
        ctx.reply('Please share your current location:', {
            reply_markup: {
                keyboard: [
                    [{ text: 'Share My Location', request_location: true }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            }
        })
    } else if (choice === 'custom_bustops') {
        userChoice = 'custom_bustops'
        ctx.replyWithMarkdownV2('Please enter *starting* location:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Back', callback_data: 'busnearby' }]
                ]
            }
        })
    }
})

// Handle extracted bus stops timings
bot.action(/Xb0e71mA3qM:\?(.+)/, async ctx => {
    await deleteMessage(ctx);
    const extractedBusstop = ctx.match[1]

    const busstopCode = await convertBusstopCode(extractedBusstop)
    if (busstopCode === null) {
        ctx.replyWithMarkdownV2('Sorry. Bus stop code invalid/ not found.', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Back', callback_data: 'bustiming' }]
                ]
            }
        })
        return
    }

    const busTimings = await getBusTimings(busstopCode)

    // Due to telegram api's markdown, require preceding '\\' before using special char
    const special_char = ['\\', '-', '|', '.', ':']
    const escapeMarkdown = (text) => {
        special_char.forEach(char => (text = text.replaceAll(char, `\\${char}`)))
        return text
    }

    // Aligning text for visual pleasure
    const headerRow = '``` |BusNo. |Next bus |Upcoming |\n'
    const columnPadding = headerRow.split('|').map(cell => ' '.repeat(cell.length))

    // Display text to user
    const currentTime = new Date()
    const formattedTime = currentTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })
    let replyMessage = headerRow
    replyMessage += ' |-------|---------|---------|\n'
    for (const timing of busTimings) {
        const busNameCell = `${timing.busName} `.padEnd(columnPadding[1].length)
        const nextBusTimingCell = `${timing.nextBusTiming} `.padEnd(columnPadding[2].length)
        const subsequentBusTimingCell = `${timing.subsequentBusTiming} `.padEnd(columnPadding[3].length)
        replyMessage += ` |${busNameCell}|${nextBusTimingCell}|${subsequentBusTimingCell}|\n`
    }
    replyMessage += '```'
    replyMessage += `\n  Last updated at ${formattedTime}`
    ctx.replyWithMarkdownV2(escapeMarkdown(replyMessage), {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Back to home", callback_data: "home" }]
            ]
        }
    })
    await ctx.answerCbQuery(`Bus stop code: ${extractedBusstop}`)
})


module.exports = {
    bot
}