const games = require('./output/games.json');

let recordGame = null;

games.seasons.forEach((season) => {
  season.weeks.forEach((week) => {
    week.games.forEach((game) => {
      if (!recordGame) {
        recordGame = game;
      }
      const minYds = Math.min(game.away.yds, game.home.yds);
      const recordMinYds = Math.min(recordGame.away.yds, recordGame.home.yds);
      if (game.gameLength > 1660 && minYds < recordMinYds) {
        recordGame = game;
      }
    });
  });
});

console.log(`The record goes to week ${recordGame.week} ${recordGame.away.name} ${recordGame.away.score} (${recordGame.away.yds} yds) @ ${recordGame.home.name} ${recordGame.home.score} (${recordGame.home.yds} yds)`);
