module.exports = async function(bot, api) {
    let responseCount = await api.getOnlineCount().catch(e => {
        console.error(e)
    })

    if(!responseCount) {
        bot.user.setPresence({
            game: {
                name : "Gameslabs with some members"
            }
        })
    } else {
        bot.user.setPresence({
            game: {
                name : `Gameslabs with ${responseCount.count} ${responseCount.count == "1" ? "member" : "members"}`
            }
        })
    }
}