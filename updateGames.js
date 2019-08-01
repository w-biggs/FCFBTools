/**
 * Check the game IDs for any games missing from the games.json, then write them.
 */

const gameIDs = require('./config/gameIDs.json');
const { checkGames } = require('./utils/checkGames');
const updateGames = require('./utils/updateGames');

const season = gameIDs.seasons[gameIDs.seasons.length - 1];
const week = season.weeks[season.weeks.length - 1];

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
