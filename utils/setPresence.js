module.exports = async function(bot, api) {
    let responseCount = await api.getOnlineCount()
    bot.user.setPresence({
        game: {
            name : `Gameslabs with ${responseCount.count} ${responseCount.count == "1" ? "member" : "members"}`
        }
    })
}