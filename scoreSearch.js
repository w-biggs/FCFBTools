const games = require('./output/games.json');

const args = process.argv.slice(2);

const [scoreA, scoreB] = args.map(arg => parseInt(arg, 10));

games.seasons.forEach((season) => {
  season.weeks.forEach((week) => {
    week.games.forEach((game) => {
      if ((game.home.score === scoreA && game.away.score === scoreB)
        || (game.home.score === scoreB && game.away.score === scoreA)) {
        let scoreInfo = '';
        if (game.home.score > game.away.score) {
          scoreInfo = `${game.home.name} beat ${game.away.name}`;
        } else {
          scoreInfo = `${game.away.name} beat ${game.home.name}`;
        }
        console.log(`Week ${game.week} - ${scoreInfo}`);
      }
    });
  });
});
