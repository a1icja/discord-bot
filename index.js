const Discord = require('discord.js');
const bot = new Discord.Client();

// Stores configs that you'd need to change if you were to host this bot by yourself
const config = require('./config.json')

// This will be used if/when Minescape has a REST API. For now it is used to make API requests
let MinescapeClass = require('./utils/MinescapeAPI')
const MinescapeAPI = new MinescapeClass(config.API_KEY)

// Now let's initialize our CommandHandler
let CommandClass = require('./utils/CommandHandler')
const CommandHandler = new CommandClass(bot, MinescapeAPI)

// And we also want to set the presence of our bot
const setPresence = require('./utils/setPresence')

// This tells us when the bot has booted up. Also should show that there are no runtime errors
bot.on('ready', async () => {
  let { calculateLevel } = require('./utils/BaseFunctions')
  console.log(calculateLevel(500))
  console.log("We are ready")
  console.log(await MinescapeAPI._getProfileID("RonDeSantis").catch(e => console.error(e)))
  setPresence(bot, MinescapeAPI)
  setInterval(() => {
    setPresence(bot, MinescapeAPI)
  }, 16e3)
})

// Here we'll handle all of our messages
bot.on('message', (message) => {
  // Return if the user is a bot (prevents feedback loops)
  if(message.author.bot) return
  // Now we tell the CommandHandler to handle it
  CommandHandler.handle(message)
})

bot.on('error', console.error);

// Log in the bot
bot.login(config.DISCORD_TOKEN)
