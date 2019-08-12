/**
 * Check if the given games aren't present in games.json yet.
 */

const games = require('../output/games.json');

/**
 * Check if the given game isn't present in games.json yet.
 *
 * @param {number} seasonNo The season of the game.
 * @param {number} weekNo The week of the game.
 * @param {string} gameID The ID of the game.
 */
const checkGame = function checkIfGameIsInJSON(seasonNo, weekNo, gameID) {
  for (let i = 0; i < games.seasons.length; i += 1) {
    const season = games.seasons[i];
    if (season.seasonNo === seasonNo) {
      for (let j = 0; j < season.weeks.length; j += 1) {
        const week = season.weeks[j];
        if (week.weekNo === weekNo) {
          for (let k = 0; k < week.games.length; k += 1) {
            const game = week.games[k];
            if (game.id === gameID) {
              return false;
            }
          }
          console.log(`${gameID} not present in S${seasonNo} W${weekNo}.`);
          return true;
        }
      }
      return new Error(`Week ${weekNo} not found in Season ${seasonNo}.`);
    }
  }
  return new Error(`Season ${seasonNo} not found.`);
};

/**
 * Filter a given array and return only game IDs that are not present in games.json.
 *
 * @param {number} seasonNo The season of the game.
 * @param {number} weekNo The week of the game.
 * @param {string[]} gameID An array of game IDs to filter.
 *
 * @returns {string[]|error} A filtered array of game IDs that are not present in games.json.
 */
const checkGames = function checkAllGamesAndReturnNonPresent(seasonNo, weekNo, gameIDs) {
  return gameIDs.filter((gameID) => {
    try {
      return checkGame(seasonNo, weekNo, gameID);
    } catch (error) {
      console.error(error);
      return error;
    }
  });
};

module.exports = {
  checkGame,
  checkGames,
};
