const CONSTANTS = require("../../data/Constants.json")
const config = require("../../config.json")
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

    // Defining a variable to a message.send gives us a Message object to edit later
    let msg = await message.channel.send(`Fetching ${player}'s stats`)

    // Get the player's stats from the API
    let stats = await this.api.getStats(player, profile).catch(e => {
      msg.edit(`Error trying to get ${player}\'s stats: \`${e}\``)
      return
    })
    // And if the API returns an error then we know that person isn't real
    if(!stats) return

    // Build a new Embed
    const embed = new Discord.RichEmbed()
    .setColor("00bfff")

    // .reduce takes all of the values of an Array and adds them up.
    // Object.values gets all of the xp values from stats
    let totalXp = Object.values(stats).reduce((total, current) => total + current)
    // We can't de reverse because the API doesn't return 0 for xp if they don't have any, so we have to add 1 if it isn't included
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

    // Now we go ahead and build every single skill field
    for(let i = 0; i < CONSTANTS.SKILLS.length; i++){
      let emoji = this.bot.emojis.find(emoji => emoji.name == config.SKILL_EMOJIS[CONSTANTS.SKILLS[i]] && emoji.guild.id == config.EMOJI_SERVER)
      let xp = (stats[CONSTANTS.SKILLS[i]]) ? BaseFunctions.formatNumber(stats[CONSTANTS.SKILLS[i]].toFixed(1).toString()) : 0
      embed.addField(`${emoji} ${BaseFunctions.capitalizeString(CONSTANTS.SKILLS[i])} [${BaseFunctions.calculateLevel(stats[CONSTANTS.SKILLS[i]])}]`, xp, true)
    }

    // Dynamically get some emojis
    let totalEmoji = this.bot.emojis.find(emoji => emoji.name == config.SKILL_EMOJIS["stats"] && emoji.guild.id == config.EMOJI_SERVER)
    let questingEmoji = this.bot.emojis.find(emoji => emoji.name == config.SKILL_EMOJIS["questing"] && emoji.guild.id == config.EMOJI_SERVER)
    embed.addField(`${questingEmoji} Questing`, stats["questing"] || 0, true)
    embed.addBlankField(true)
    embed.addField(`${totalEmoji} Total XP [${totalLevel}]`, BaseFunctions.formatNumber(totalXp.toFixed(1)), true)
    // Woop, we're done let's *edit* our message
    msg.edit(embed)
  }
}

module.exports = Stats
