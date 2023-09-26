const { bot } = require('./bot')

// launch bot
bot.launch().then(() => {
    console.log('Bot is running')
}).catch(err => console.error(err))

// enable graceful stop
// SIGINT is when you ctrl C to end, SIGTERM is when u kill command
process.once('SIGINT', () => {
    console.log('Bot stopping (SIGINT)')
    bot.stop('SIGINT')
})

process.once('SIGTERM', () => {
    console.log('Bot stopping (SIGTERM)')
    bot.stop('SIGTERM')
})