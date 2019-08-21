/**
 * Check the game IDs for any games missing from the games.json, then write them.
 */

const gameIDs = require('./config/gameIDs.json');
const { checkGames } = require('./utils/checkGames');
const updateGames = require('./utils/updateGames');

const args = process.argv.slice(2);

const season = gameIDs.seasons[gameIDs.seasons.length - 1];
let week = season.weeks[season.weeks.length - 1];

if (args.length === 1) {
  const weekNo = parseInt(args[0], 10);
  console.log(`Using week ${weekNo}`);
  [week] = season.weeks.filter(seasonWeek => seasonWeek.weekNo === weekNo);
} else {
  console.log(`Using week ${week.weekNo}, as no week was given.`);
}

const newGames = checkGames(season.seasonNo, week.weekNo, week.games);

try {
  updateGames(season.seasonNo, week.weekNo, newGames)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error(error);
    });
} catch (error) {
  console.error(error);
}
