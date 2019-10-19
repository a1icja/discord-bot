const CONSTANTS = require('../data/Constants.json')
const funcs = {
  /**
   * Formats a number to 1,234,567
   * @param x The number to formate
   */
  formatNumber: (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
  /**
   * Capitilizes a String
   * @param x The string to capitilize
   */
  capitalizeString: (x) => x[0].toUpperCase() + x.slice(1),
  /**
   * Calculates a level from an XP value
   * @param xp The xp to calculate from (int)
   */
  calculateLevel: (xp) => {
    if(!xp) return 1
    for(let i = 0; i < CONSTANTS.LEVELS.length; i++){
      if(xp < CONSTANTS.LEVELS[i]) return i
    }
    return 120
  },
  /**
   * Calculates the combat level from an object of skill xp values
   * @param skills The skills object to calculate the combat level from
   */
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
