class Ping {
  constructor(bot, api){
    this.bot = bot;
    this.api = api;

    this.name = "Ping"
    this.description = "Pong! Just if you're not sure if the bot is responsive"
    this.usage = "ping"
    this.aliases = []
  }

  execute(message){
    message.channel.send("Pong")
  }
}

module.exports = Ping
