const CONSTANTS = require('../data/Constants.json')
const funcs = {
  formatNumber: (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
  capitalizeString: (x) => x[0].toUpperCase() + x.slice(1),
  calculateLevel: (xp) => {
    if(!xp) return 1
    for(let i = 0; i < CONSTANTS.LEVELS.length; i++){
      if(xp < CONSTANTS.LEVELS[i]) return i
    }
    return 120
  },
  calculateCombatLevel: (skills) => {
    let combatLevel = 0
    const COMBAT_SKILLS_4 = ["defence", "strength", "attack", "constitution", "prayer", "magic", "ranged"]
    const COMBAT_SKILLS_9 = []
    for(let i in skills){
      if(COMBAT_SKILLS_4.includes(i)) combatLevel += (funcs.calculateLevel(skills[i]) / 7)
      if(COMBAT_SKILLS_9.includes(i)) combatLevel += (funcs.calculateLevel(skills[i]) / 9)
    }
    return Math.floor(combatLevel)
  }
}

module.exports = funcs
