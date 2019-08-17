const Discord = require("discord.js")
const config = require("../../config.json")

class Help {
  constructor(bot, api){
    this.bot = bot;
    this.api = api;

    // Data
    this.name = "Help"
    this.usage = "help {command}"
    this.example = "help ping"
    this.aliases = ["Commands"]
  }

  /**
   * Builds a help list of all commands
   * @param  {Message} message The message that the handler recieved
   */
  _buildGeneralHelp(message){
    const embed = new Discord.RichEmbed()
    .setTitle("Showing all Commands")
    .setFooter(`Use ${config.prefix}help [Command] for more detailed help of a command`)
    .setColor(config.COLOR)
    // This for of loop goes through every single category and pulls all of the commands from it.
    for(let category of Object.keys(this.bot.organiziedCommands)){
      let commands = this.bot.organiziedCommands[category].join(', ')
      embed.addField(category, commands)
    }
    message.channel.send(embed)
  }

  /**
   * Builds a specific command helper
   * @param  {Message} message The message that the handler recieved
   * @param  {string} args    A string of the args recieved
   */
  _buildCommandHelp(message, args){
    args = args.split(" ")
    // We check that it is an actual command, if it is not then we go ahead to buildGeneralHelp
    if(!this.bot.commands[args[0]]) return this._buildGeneralHelp(message)
    // You'll see that we can use this.bot.commands[args[0]] to get info
    // this works because inside of the bot.commands object is an instance of the Command which has a .example and other in it (check the data in the top of this help command)
    const embed = new Discord.RichEmbed()
    .setTitle(`Showing specific help for \`${this.bot.commands[args[0]].name}\``)
    .setDescription(this.bot.commands[args[0]].description)
    .addField("Usage:", `${config.prefix}${this.bot.commands[args[0]].usage}`)
    .setFooter(`Get a list of all commands by typing \`${config.prefix}help\``)
    .setColor(config.COLOR)
    if(this.bot.commands[args[0]].example) embed.addField("Example:", `${config.prefix}${this.bot.commands[args[0]].example}`)
    if(this.bot.commands[args[0]].aliases.length != 0) embed.addField("Aliases:", this.bot.commands[args[0]].aliases)
    message.channel.send(embed)
  }

  execute(message, args){
    if(args){
      this._buildCommandHelp(message, args)
    } else {
      this._buildGeneralHelp(message, args)
    }
  }

}

module.exports = Help
