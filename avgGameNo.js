const games = require('./output/games.json');

const teams = [];

for (let i = 1; i < 2; i += 1) {
  const season = games.seasons[i];
  for (let j = 0; j < season.weeks.length; j += 1) {
    const week = season.weeks[j];
    for (let k = 0; k < week.games.length; k += 1) {
      const game = week.games[k];
      let foundHome = false;
      let foundAway = false;
      for (let l = 0; l < teams.length; l += 1) {
        const team = teams[l];
        if (team.name === game.home.name) {
          team.games += 1;
          foundHome = true;
        } else if (team.name === game.away.name) {
          team.games += 1;
          foundAway = true;
        }
      }
      if (!foundHome) {
        teams.push({
          name: game.home.name,
          games: 1,
        });
      }
      if (!foundAway) {
        teams.push({
          name: game.away.name,
          games: 1,
        });
      }
    }
  }
}

let gameSum = 0;
for (let i = 0; i < teams.length; i += 1) {
  const team = teams[i];
  gameSum += team.games;
}
console.log(gameSum / teams.length);
