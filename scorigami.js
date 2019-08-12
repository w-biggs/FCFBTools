const fs = require('fs');
const games = require('./output/games.json');

const csv = [];

games.seasons.forEach((season) => {
  season.weeks.forEach((week) => {
    week.games.forEach((game) => {
      if (game.home.score > game.away.score) {
        csv.push(`${game.home.score}, ${game.away.score}`);
      } else {
        csv.push(`${game.away.score}, ${game.home.score}`);
      }
    });
  });
});

fs.writeFile('./output/scores.csv', csv.join('\n'), (err) => {
  if (err) {
    console.error(err);
  }
  console.log('./output/scores.csv has successfully been written.');
});
