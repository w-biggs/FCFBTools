/**
 * Update games.json with the given games.
 */

const v8 = require('v8');
const { fetchJsons } = require('./fetchJson');
const parseGame = require('./parseGame');
const games = require('../output/games.json');
const writeJson = require('./writeJson');

/**
 * Clones an object.
 * @param {Object} obj The object to clone.
 */
const structuredClone = obj => v8.deserialize(v8.serialize(obj));

/**
 * Write the game to games.json.
 *
 * @param {number} seasonNo The season of the game.
 * @param {number} weekNo The week of the game.
 * @param {Object[]} parsedGames The JSONs of the games.
 * @param {Object} gamesJson The games.json.
 */
const updateWeek = function updateWeek(seasonNo, weekNo, parsedGames, gamesJson) {
  const newGames = structuredClone(gamesJson);
  for (let i = 0; i < newGames.seasons.length; i += 1) {
    const season = newGames.seasons[i];
    if (season.seasonNo === seasonNo) {
      for (let j = 0; j < season.weeks.length; j += 1) {
        const week = season.weeks[j];
        if (week.weekNo === weekNo) {
          week.games = week.games.concat(parsedGames);
          return newGames;
        }
      }
      console.log(`Week ${weekNo} not found in Season ${seasonNo} - creating it.`);
      season.weeks.push({
        weekNo,
        games: parsedGames,
      });
      return newGames;
    }
  }
  console.log(`Season ${seasonNo} not found - creating it.`);
  newGames.seasons.push({
    seasonNo,
    weeks: [
      {
        weekNo,
        games: parsedGames,
      },
    ],
  });
  return newGames;
};

/**
 * Writes the IDs and number of new games to the log.
 * @param {Object<string,number|string|object>[]} parsedGames
 *  - An array of the games that we're adding to games.json.
 */
const logWrittenGames = function logWhatGamesWeAreWriting(parsedGames) {
  const ids = [];
  parsedGames.forEach((game) => {
    ids.push(game.id);
  });

  console.log(`Writing ${parsedGames.length} games: ${ids.join(', ')}.`);
};

module.exports = (seasonNo, weekNo, gameIDs) => new Promise((resolve, reject) => {
  fetchJsons(gameIDs)
    .then((responses) => {
      const parsedGames = responses.map(response => parseGame(response.json))
        .filter(parsedGame => parsedGame);
      logWrittenGames(parsedGames);
      try {
        const newGames = updateWeek(seasonNo, weekNo, parsedGames, games);

        writeJson(newGames, 'games.json')
          .then((response) => {
            resolve(response);
          })
          .catch(error => reject(error));
      } catch (error) {
        reject(error);
      }
    })
    .catch(error => reject(error));
});
