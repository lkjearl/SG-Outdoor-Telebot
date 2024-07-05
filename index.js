const { bot } = require('./bot')

bot.launch().then(() => {
    console.log('Bot is running')
}).catch(err => console.error(err))

// enable graceful stop
process.once('SIGINT', () => {
    console.log('Bot stopping (SIGINT)')
    bot.stop('SIGINT')
})

process.once('SIGTERM', () => {
    console.log('Bot stopping (SIGTERM)')
    bot.stop('SIGTERM')
})