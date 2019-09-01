const CONSTANTS = require('../../data/Constants.json')
const Discord = require('discord.js')
const BaseFunctions = require('../../utils/BaseFunctions.js')
const config = require('../../config.json')

class Top {
  constructor(bot, api){
    this.bot = bot;
    this.api = api;

    // Data
    this.name = "Top"
    this.description = "Gets the top players on certain stats, defaults server to minescape, you'll have to specify for others"
    this.usage = "top [stat] {server}"
    this.example = "top mining minescape"
    this.aliases = ["lead", "leaderboard"]
  }

  _buildMessage(message, top, stat, game) {
    const embed = new Discord.RichEmbed()
    .setTitle(`Showing the top players in ${stat}`)
    .setColor(config.COLOR)

    for(let i = 0; i < top.length; i++) {
      if(i == 9) embed.addBlankField(true)
      let player = top[i]
      if(game == "minescape" && stat != "xp") {
        if(stat == "combat") {
          let combatLevel = BaseFunctions.calculateCombatLevel(player)
          embed.addField(`${i+1} - ${player.user.name}`, 
          `**[${combatLevel}]** - ${BaseFunctions.formatNumber(Object.values(player).reduce((total, toAdd) => isNaN(toAdd) ? total : total + toAdd).toFixed(1))}`, true)
        } else {
          embed.addField(`${i+1} - ${player.user.name}`, 
          `**[${BaseFunctions.calculateLevel(player.result.toFixed(1))}]** - ${BaseFunctions.formatNumber(player.result.toFixed(1))}`, true)
        }
      } else {
        embed.addField(`${i+1} - ${player.user.name}`, BaseFunctions.formatNumber(player.result ? player.result.toFixed(0) : 0), true)
      }
    }

    embed.addBlankField(true)
    message.channel.send(embed)
  }

  async execute(message, args){
    args = args.replace(/battle of the heroes/ig, "heroes").split(" ")
    let game = args[args.length-1]
    let stat = args.slice(0, -1).join(" ") || "xp"
    if(args.length <= 1) {
      game = "minescape"
      stat = args[0] || "xp"
    }
    if(!CONSTANTS.API_LOCATIONS[game]) return message.channel.send(`Are you sure that \`${game}\` is a game?`)

    let top = await this.api.getTop(stat, game).catch(e => {
      message.channel.send(`There was an error attempting to retrieve the top stats: \`${e}\``)
    })

    if(!top) return

    this._buildMessage(message, top, stat, game)
  }
}

module.exports = Top
