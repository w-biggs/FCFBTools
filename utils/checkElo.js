/**
 * Check whether the Game ID is already written to the Elo.
 */
const elo = require('../output/elo.json');

module.exports = (homeName, seasonNo, weekNo, gameID) => {
  for (let i = 0; i < elo.teams.length; i += 1) {
    const team = elo.teams[i];
    if (team.name === homeName) {
      for (let j = 0; j < team.seasons.length; j += 1) {
        const season = team.seasons[j];
        if (season.seasonNo === seasonNo) {
          for (let k = 0; k < season.weeks.length; k += 1) {
            const week = season.weeks[k];
            if (week.weekNo === weekNo) {
              const inElo = (week.gameInfo.id === gameID);
              if (!inElo) {
                console.log(week.gameInfo.id, gameID);
              }
              return inElo;
            }
          }
        }
      }
    }
  }
  return false;
};
