const games = require('../output/games.json');

let totalScore = 0;
let totalGames = 0;
let totalMoV = 0;
const movs = [];

const calcMedian = function calcMedian(movsArray) {
  const half = Math.floor(movsArray.length / 2);
  
  movsArray.sort((a, b) => a - b);
  
  if (movsArray.length % 2) {
    return movsArray[half];
  }

  return (movsArray[half - 1] + movsArray[half]) / 2.0;
};

const avgScore = function calcAverageScore() {
  for (let i = 0; i < games.seasons.length; i += 1) {
    const season = games.seasons[i];
    for (let j = 0; j < season.weeks.length; j += 1) {
      const week = season.weeks[j];
      for (let k = 0; k < week.games.length; k += 1) {
        const game = week.games[k];
        totalScore += game.home.score;
        totalScore += game.away.score;
        totalGames += 1;
        totalMoV += Math.abs(game.home.score - game.away.score);
        movs.push(Math.abs(game.home.score - game.away.score));
      }
    }
  }

  return {
    score: (totalScore / (totalGames * 2)),
    mov: totalMoV / totalGames,
    medMov: calcMedian(movs),
  };
};

module.exports = avgScore;
