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
    this.description = "Gets the top players"
    this.usage = "top {skill1}, {skill2}..., {page}"
    this.example = "top mining 2"
    this.aliases = ["lead", "leaderboard"]
  }

  _makeMessage(message, top, skills, page, combat) {
    // This makes the embed to add to
    const embed = new Discord.RichEmbed()
    .setTitle(`Showing the top players ${combat ? "in combat" : `${skills.length > 1 ? `in skills ${skills.join(', ')}` : skills.length == 0 ? `by total xp` : `in ${skills[0]}`}`} on page ${page}`)
    .setColor(config.COLOR)
    
    // Let's loop through each person
    for(let i = 0; i < top.length; i++){
      // We have pages so we need to figure out what place they are, it adds i + 1 so that the first person is 1 and then adds 10 * page - 1 which makes it something like 11 if it is the 2nd page
      let position = ((i+1)+(10*(page-1))).toString()
      // This is a cosmetic thing to make the final player in the middle of the embed
      if(i == 9) embed.addBlankField(true)
      // Now let's tally up all of their total levels
      let skillsLevel = 0
      // Goes through each skill and calculates the total level
      for(let skill in top[i].skills) {
        let level = BaseFunctions.calculateLevel(top[i].skills[skill])
        skillsLevel += level
      }
      // Woah, they want combat so let's override that past with their combat level instead
      if(combat) {
        skillsLevel = BaseFunctions.calculateCombatLevel(top[i].skills)
      }

      // Now let's add on our calculated information and go onto the next one
      embed.addField(`${position} - ${top[i].username}`, `**[${skillsLevel}]** - ${BaseFunctions.formatNumber(Math.round(top[i].totalXp*10)/10)}`, true)
    }

    // Also makes the last person in the middle of the embed
    embed.addBlankField(true)

    // Send this beast
    message.channel.send(embed)
  }

  async execute(message, args){
    return message.channel.send("Not now")
    // This is a little bit more complex than a args.split(", ") but that is because we have to handle the pages
    // If we used .split(", ") then it would read the page as something like "fishing 2" and not split properly
    args = args.replace(new RegExp(",", "g"), "").split(" ")

    // Helps with errors
    if(!args[0]){
      args = []
    }

    // Declare some variables, also makes defaults
    let skills = []
    let page = "1"
    let combat = false

    // Now we go through each arg and check some information about it
    for(let i = 0; i < args.length; i++){
      // The person has searched for the top combat, we're just gonna trash everything else and just going to use the top combat
      if(args[i].toLowerCase() == "combat") {
        combat = true
        skills = ["defense", "strength", "attack", "constitution", "prayer", "magic", "ranged"]
      // It isn't combat, is it a skill or a page?
      } else {
        if(CONSTANTS.SKILLS.indexOf(args[i].toLowerCase()) < 0) {
          // Cant find the skill but it's a page
          if(!isNaN(args[i])){
            page = args[i]
          } else {
            // Not a skill or a page
            return message.channel.send(`Can not find skill ${args[i]}`)
          }
        } else {
          // It's a skill, let's add it to the list
          skills.push(args[i].toLowerCase())
        }
      }
    }

    // Let's find this list of top players
    let top = await this.api.getTop(skills, page).catch(e => {
      // It messed up, let's log it
      console.error(e)
      message.channel.send(`Error trying to recieve the top data: \`${e}\``)
      return 
    })

    // Nothing returned... weird, let's not continue
    if(!top) {
      return
    }

    // Now let's build the message
    this._makeMessage(message, top, skills, page, combat)
  }
}

module.exports = Top
