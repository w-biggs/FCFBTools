const elo = require('./output/elo.json');
const writeJson = require('./utils/writeJson');

for (let i = 0; i < elo.teams.length; i += 1) {
  const team = elo.teams[i];
  team.wins = 0;
  team.losses = 0;
  team.ties = 0;
  for (let j = 0; j < team.seasons.length; j += 1) {
    const season = team.seasons[j];
    if (season.seasonNo === 2) {
      season.weeks = season.weeks.filter(week => week.weekNo === 0);
    }
  }
}

writeJson(elo, 'elo.json');
