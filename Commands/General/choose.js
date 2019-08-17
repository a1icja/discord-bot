class Choose {
  constructor(bot, api){
    this.bot = bot;
    this.api = api;

    // Data
    this.name = "Choose"
    this.description = "Chooses randomly from an input"
    this.usage = "choose [option1], {option2}, {option3}..."
    this.example = "choose scip, joey, this multi word option, anotha one"
    this.aliases = ["pickone"]
  }

  execute(message, args){
    // We make it so that each new option is seperated by a comma
    args = args.split(', ')
    // Lets make sure it actually sends a message
    if(args.length == 0) return message.channel.send("I need at least one option")
    // This will generate a random number between 0 and 1 less than arg length
    let option = Math.floor(Math.random() * args.length)

    message.channel.send(args[option])
  }
}

module.exports = Choose
