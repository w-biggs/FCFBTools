const elo = require('./output/elo.json');
const writeJson = require('./utils/writeJson');

elo.teams.forEach((team) => {
  team.seasons.forEach((season) => {
    if (season.seasonNo === 2) {
      season.weeks = season.weeks.filter(week => week.weekNo === 0);
    }
  });
});

writeJson(elo, 'elo.json');
