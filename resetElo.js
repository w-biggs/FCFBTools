const elo = require('./output/elo copy.json');
const writeJson = require('./utils/writeJson');


for (let i = 0; i < elo.teams.length; i += 1) {
  const team = elo.teams[i];
  team.wins = 0;
  team.losses = 0;
  team.ties = 0;
  for (let j = 0; j < team.seasons.length; j += 1) {
    const season = team.seasons[j];
    if (season.seasonNo === 2) {
      for (let k = 0; k < season.weeks.length; k += 1) {
        const week = season.weeks[k];
        if (week.weekNo < 4) {
          if (week.gameInfo) {
            if (week.gameInfo.result === 'win') {
              team.wins += 1;
            } else if (week.gameInfo.result === 'loss') {
              team.losses += 1;
            } else {
              team.ties += 1;
            }
            team.elo = week.gameInfo.elo;
          }
        }
      }
      season.weeks = season.weeks.filter(week => week.weekNo < 4);
    }
  }
}

writeJson(elo, 'elo.json');
