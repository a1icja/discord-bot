const fs = require('fs');
const config = require('../config.json')
const specials = require("../data/Specials.json")

class CommandHandler {
  constructor(bot, api){
    // Define some variables which will be used later
    this.bot = bot
    this.api = api
    // Used for handling commands: {commandName : commandClass}
    this.bot.commands = {}
    // Used for the help command: {user: ["command1", "command2"...]}
    this.bot.organiziedCommands = {}

    // Please note the difference between fs and require. require is using the file location and pulling relative from that.
    // On the other hand fs is relative to the working node process which is located at index.js.
    let commandDir = fs.readdirSync('./Commands')
    // This gets all of the files AND directories in ../Commands. So now we iterate through it and find all of the js files and directories
    for(let file of commandDir){
      // Boolean wether or not it is a directory
      let isDirectory = fs.lstatSync(`./Commands/${file}`).isDirectory()
      // This regex checks if the file ends with .js (which in all honesty could be done with .endsWith())
      if(/.js$/.test(file) && !isDirectory){
        // We're going to make a new instance of the class to get it's name and aliases
        let CommandClass = require(`../Commands/${file}`)
        let Command = new CommandClass(this.bot, this.api)
        // Add the command to the command list
        this.bot.commands[Command.name.toLowerCase()] = Command
        for(let i = 0; i < Command.aliases.length; i++){
          // Also add all (if any) of it's aliases
          this.bot.commands[Command.aliases[i].toLowerCase()] = Command
        }
        // Now, because these are unorganized put them into an
        (this.bot.organiziedCommands['unknown']) ? this.bot.organiziedCommands['unknown'].push(Command.name) : this.bot.organiziedCommands['unknown'] =  [Command.name]
      } else if (isDirectory){
        // So now everything in here is in it's "proper" form. Commands/Category/file.js

        // Re-read the dir nested in Commands
        let categorizedCommands = fs.readdirSync(`./Commands/${file}`)
        // And now get all of the files in the nested dir. This code will be quite similair to the previous
        for(let categorizedCommand of categorizedCommands){
          // Boolean wether or not it is a directory, anything nested in ../Commands/Category is going to be ignored though
          let isDirectory = fs.lstatSync(`./Commands/${file}/${categorizedCommand}`).isDirectory()
          // Same regex from earlier
          if(/.js$/.test(categorizedCommand) && !isDirectory){
            // And now we are adding it back into the commands folder but this time we need to change up it's location
            let CommandClass = require(`../Commands/${file}/${categorizedCommand}`)
            let Command = new CommandClass(this.bot, this.api)
            this.bot.commands[Command.name.toLowerCase()] = Command
            for(let i = 0; i < Command.aliases.length; i++){
              this.bot.commands[Command.aliases[i].toLowerCase()] = Command
            }
            // And we change this up a little bit to add to it's nested directory instead of an "unkown" in organiziedCommands
            (this.bot.organiziedCommands[file]) ? this.bot.organiziedCommands[file].push(Command.name) : this.bot.organiziedCommands[file] =  [Command.name]
          }
        }
      }
    }
  }

  _checkSpecialMessage(message) {
    if(config.ADMINS.includes(message.author.id) && specials[message.content]) return message.channel.send(specials[message.content])
  }

  /**
   * Here is where we handle all of the messages from the bot.on('message') event
   * @param  {Message} message The message from the bot
   */
  handle(message){
    this._checkSpecialMessage(message)

    // Check that it starts with the prefix
    if(!message.content.startsWith(config.prefix)) return

    // So now we get some content and work it around
    let content = message.content.split(' ')
    // This should make >stats JoeyB to just stats
    let commandString = content.shift().slice(config.prefix.length).toLowerCase()
    // And this would return the JoeyB portion
    let args = content.join(' ')
    // And now we get the Command Classs in bot.commands and then run it
    if(this.bot.commands[commandString]) this.bot.commands[commandString].execute(message, args)
  }
}

module.exports = CommandHandler
