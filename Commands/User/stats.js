const CONSTANTS = require("../../data/Constants.json")
const BaseFunctions = require("../../utils/BaseFunctions.js")
const Discord = require("discord.js")

class Stats {
  constructor(bot, api){
    this.bot = bot;
    this.api = api;

    // Data
    this.name = "Stats"
    this.description = "Returns the Minescape stats for a user"
    this.usage = 'stats [username] {profile}'
    this.example = 'stats JoeyB 2'
    this.aliases = ['level', 'skills']
  }

  async execute(message, args){
    let player = args.split(" ")[0]
    let profile = args.split(" ")[1] || null
    if(profile) profile = parseInt(profile) - 1

    let msg = await message.channel.send(`Fetching ${player}'s stats`)

    // Get the player's stats from the API
    let stats = await this.api.getStats(player, profile).catch(e => {
      msg.edit(`Error trying to get ${player}\'s stats: \`${e}\``)
      return
    })
    // And if the API returns an error then we know that person isn't real
    if(!stats) return

    const embed = new Discord.RichEmbed()
    .setColor("00bfff")

    let totalXp = Object.values(stats).reduce((total, current) => total + current)
    let totalLevel = 0
    for(let i = 0; i < CONSTANTS.SKILLS.length; i++) {
      if(!stats[CONSTANTS.SKILLS[i]]) {
        totalLevel += 1
      } else {
        totalLevel += BaseFunctions.calculateLevel(stats[CONSTANTS.SKILLS[i]])
      }
    }
    let combatLevel = BaseFunctions.calculateCombatLevel(stats)

    embed.setTitle(`${player} [${Math.floor(combatLevel)}]`)
    for(let i = 0; i < CONSTANTS.SKILLS.length; i++){
      let emoji = this.bot.emojis.find(emoji => emoji.name == CONSTANTS.SKILLS[i] && emoji.guild.id == '426107164650766357')
      let xp = (stats[CONSTANTS.SKILLS[i]]) ? BaseFunctions.formatNumber(stats[CONSTANTS.SKILLS[i]].toFixed(1).toString()) : 0
      embed.addField(`${emoji} ${BaseFunctions.capitalizeString(CONSTANTS.SKILLS[i])} [${BaseFunctions.calculateLevel(stats[CONSTANTS.SKILLS[i]])}]`, xp, true)
    }

    let totalEmoji = this.bot.emojis.find(emoji => emoji.name == "stats" && emoji.guild.id == '426107164650766357')
    let questingEmoji = this.bot.emojis.find(emoji => emoji.name == "questing" && emoji.guild.id == '426107164650766357')
    embed.addField(`${questingEmoji} Questing`, stats["questing"] || 0, true)
    embed.addBlankField(true)
    embed.addField(`${totalEmoji} Total XP [${totalLevel}]`, BaseFunctions.formatNumber(totalXp.toFixed(1)), true)
    msg.edit(embed)
  }
}

module.exports = Stats
