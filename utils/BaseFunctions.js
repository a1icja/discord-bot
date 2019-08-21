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
    const COMBAT_SKILLS = ["defence", "strength", "attack", "constitution", "magic", "ranged", "prayer"]
    for(let i of COMBAT_SKILLS){
      if(skills[i]) {
        combatLevel += funcs.calculateLevel(skills[i])
      } else {
        combatLevel++
      }
    }
    return Math.floor(combatLevel/7)
  }
}

module.exports = funcs
