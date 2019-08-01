const checkElo = require('./utils/checkElo');
const calcElo = require('./utils/calcElo');
const { writeElos } = require('./utils/writeElo');
const games = require('./output/games.json');

const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log(`Requires two arguments - season and week numbers. ${args.length} arguments were given.`);
  process.exit(1);
}

const [seasonNo, weekNo] = args.map(arg => parseInt(arg, 10));

const eloGames = [];

console.log(`S${seasonNo}, W${weekNo}`);

for (let i = 0; i < games.seasons.length; i += 1) {
  const season = games.seasons[i];
  if (season.seasonNo === parseInt(seasonNo, 10)) {
    for (let j = 0; j < season.weeks.length; j += 1) {
      const week = season.weeks[j];
      if (week.weekNo === parseInt(weekNo, 10)) {
        for (let k = 0; k < week.games.length; k += 1) {
          const game = week.games[k];
          const inElo = checkElo(game.home.name, seasonNo, weekNo, game.id);
          if (!inElo) {
            eloGames.push({
              homeName: game.home.name,
              awayName: game.away.name,
              eloValues: calcElo(game),
            });
            console.log(`Writing game ${game.id}`);
          }
        }
      }
    }
  }
}

writeElos(eloGames);
