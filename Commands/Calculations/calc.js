const Constants = require("../../data/Constants.json")
const config = require("../../config.json")
const BaseFunctions = require("../../utils/BaseFunctions")
const XP = require("../../data/XP.json")
const { RichEmbed } = require("discord.js")

class Calc {
  constructor(bot, api){
    this.bot = bot;
    this.api = api;

    this.name = "Calc"
    this.description = "Is able to calculate how many uses it's going to take for you to get to a certain level"
    this.usage = "calc"
    this.aliases = []
  }

  execute(message, args) {
    /*
      I'd say a lot of the code in here is pretty simple to read but overall kinda weird: Let me explain myself...
      So we declare all of our variables so that they can be accessed within the switch statement, just some scoping things. And then we declare a step variable, this is what checks the steps
      So then we make what's called a MessageCollector which takes a filter, in this case just makes sure they both have the same author, and whenever that passes through it'll send an event saying "Hey I got a message"
      That's what the collector.on("collect") is
      Then we see which step we're on and increment it by 1 (step++).
        We do this with a switch() case statement
        These are just glorified if / elif / elif / elif.... else statements
      Then throughout each step we define a variable we want to i.e. step 1 defines the skill variable to whatever the person inputs
      The only weird part is smithing, we want them to change how they're smithing: are they just buying bars? Are they gonna sell their bars from ores? We allow them to choose
        What we do is we add in intermidiary step: Step 1002
        We can simply add and subtract a 1000 in order to get to this step
        So we go from step 1 -> 1002 -> 2 and so forth like a normal command.
        This is also expressed in xp.json where smithing has 1, 2, 3 options
      And then collector.end basically is where we handle any caught exceptions or if the person just decides not to respond.
    */
    let step = 0
    let skill, data, task, start, end, booster;

    message.channel.send("Welcome to the tool to help you calculate how many usages something is going to take. Let me start off by asking what skill we're going to be calculating with?")

    const filter = msg => msg.author.id === message.author.id
    const collector = message.channel.createMessageCollector(filter, { time: 60000 })

    collector.on("collect", msg => {
        step++
        switch(step) {
          case 1:
            skill = msg.content.toLowerCase()
            if(!Constants.SKILLS.includes(skill)) {
              return collector.stop(`Sorry, but the bot does not recognize the skill \`${skill}\`, you can try again by re-running the command`)
            }

            if(skill == "smithing") {
              step += 1000
              return msg.channel.send(`I guess we'll be doing smithing. Now I need to ask you *how* you are executing your smithing? Reply with... \n\`1\` - You're smelting the ore into the bar and then turning that into a tool \n\`2\` - You're only smelting the ore into bars \n\`3\` - You're only turning the bars into tools`)
            }

            data = XP[skill]
            msg.channel.send(`Alrighty, I'll be calculating for the skill ${BaseFunctions.capitalizeString(skill)}. I've found some tasks that can be useful for you. May you please respond with which task you'd like to use: \`\`\`\n${Object.keys(XP[skill]).map(x => BaseFunctions.capitalizeString(x)).join("\n")}\`\`\``)
            break;
          case 1002:
            if(msg.content != "1" && msg.content != "2" && msg.content != "3") {
              return collector.stop(`Sorry but it appears that ${msg.content} is not a proper input`)
            }
            data = XP[skill][msg.content]
            msg.channel.send(`Alrighty, I'll be calculating for the skill ${BaseFunctions.capitalizeString(skill)}. I've found some tasks that can be useful for you. May you please respond with which task you'd like to use: \`\`\`\n${Object.keys(XP[skill][msg.content]).map(x => BaseFunctions.capitalizeString(x)).join("\n")}\`\`\``)
            step -= 1001
            break;
          case 2:
            task = msg.content.toLowerCase()
            if(!Object.keys(data).includes(task)) {
              return collector.stop(`Sorry, but ${skill} does not have the task ${task}`)
            }
            data = data[task]
            msg.channel.send(`Perfect! I've found the task ${task} within ${skill} which gives ${data} XP per iteration. Now what level are we starting at, if you give me a number greater than 119 and I'll infer you're using xp instead`)
            break;
          case 3:
            start = msg.content
            if(isNaN(start)) {
              return collector.stop(`Sorry, but the bot doesn't think ${start} is a proper number`)
            }

            start = parseFloat(start)
            if(start < 0) {
              return collector.stop(`I don't think you can have ${start} xp in minescape, if you do I'd contact scip.`)
            }

            if(start <= 119) {
              let level = start
              start = Constants.LEVELS[start - 1]

              return message.channel.send(`Okay, we're starting on level ${level} which I've adjusted to be ${BaseFunctions.formatNumber(start)} XP. Now may you please tell me what level / XP we're finishing at?`)
            }

            message.channel.send(`Okay, we're starting at ${BaseFunctions.formatNumber(start)} XP. Now may you please tell me what level / XP we're finishing at?`)
            break;
          case 4:
            end = msg.content
            if(isNaN(end)) {
              return collector.stop(`Sorry, but the bot doesn't think ${end} is a proper number`)
            }

            end = parseFloat(end)
            if(end < 0) {
              return collector.stop(`I don't think you can have ${end} xp in minescape, if you do I'd contact scip.`)
            }

            function _checkNegative(end, start) {
              if(end < start) {
                collector.stop(`I guess you are trying to go back ${BaseFunctions.formatNumber(end - start)} XP. I can't help you with that...`)
                return true
              }
              return false
            }
  
            if(end <= 120) {
              let level = end
              end = Constants.LEVELS[end - 1]

              if(_checkNegative(end, start)) return

              return message.channel.send(`Okay, we're going to finish on level ${level} which I've adjusted to be ${BaseFunctions.formatNumber(end)} XP. Now may you please tell me how strong of a booster is going to be on? If there won't be just respond with 1.`)
            }

            if(_checkNegative(end, start)) return
  
            message.channel.send(`Okay, we're finishing at ${BaseFunctions.formatNumber(end)} XP. Now may you please tell me how strong of a booster is going to be on? If there won't be just respond with 1.`)
            break;
          case 5:
            booster = msg.content
            if(isNaN(booster)) {
              return collector.stop(`Sorry, but the bot doesn't think ${booster} is a proper number`)
            }

            booster = parseFloat(booster)
            if(booster < 1) {
              collector.stop(`I've never heard of a booster of ${booster}x...`)
            }

            const embed = new RichEmbed()
            .setTitle(`Trying to grind some ${skill}`)
            .addField("How far are we jumping?", `We are starting at ${BaseFunctions.formatNumber(start)} XP and finishing at ${BaseFunctions.formatNumber(end)}. This is a jump of ${BaseFunctions.formatNumber(end - start)} XP`)
            .addField(`How much XP does ${task} give?`, `${data} XP`)
            .addField("Any boosters?", `${booster == 1 ? "Nope, we're grinding" : `Yep, a ${booster}x booster`}`)
            .addField("The results", `I've calculated that you'd need to grind ${BaseFunctions.formatNumber(Math.ceil((end - start) / booster / data))} ${task} at ${data * booster} XP per ${task}`)
            .setColor(config.COLOR)

            message.channel.send(embed)
            collector.stop("done")
        }
    })

    collector.on("end", (collected, reason) => {
      if(reason === "time") {
        message.channel.send("The request has timed out")
      } else {
        if(reason === "done") return
        
        message.channel.send(reason)
      }
    })
  }
}

module.exports = Calc
