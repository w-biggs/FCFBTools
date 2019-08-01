/**
 * Convert the old fcs.json format to the new games.json format.
 */

const fcsJson = require('./output/fcs.json');
const { fetchJson } = require('./utils/fetchJson');
const writeJson = require('./utils/writeJson');

/**
 * Converts the format of a single game.
 *
 * @param {Object} game The game to parse / convert.
 */
const convertGame = function convertSingleGameFormat(game) {
  return fetchJson(game.id, true)
    .then((response) => {
      const { data } = response.json.data.children[0];
      const endTime = data.edited;

      const newGame = {
        week: game.week,
        id: game.id,
        gameLength: game.gameLength,
        startTime_utc: game.date_utc,
        endTime_utc: endTime,
        home: {},
        away: {},
      };

      // Convert numbers. DRY.
      ['home', 'away'].forEach((teamString) => {
        const team = game[teamString];
        Object.keys(team).forEach((key) => {
          if (key === 'name') {
            newGame[teamString].name = team.name;
          } else {
            newGame[teamString][key] = parseInt(team[key], 10);
          }
        });
      });

      return newGame;
    })
    .catch((error) => {
      console.error(error);
    });
};

/**
 * Does the converting.
 *
 * @param {Object<string,Array<Object<string,Object<string,string|number>>>>} oldJson
 *  - The old JSON file to convert from.
 * @returns {Object} - The new JSON file to write.
 */
const convert = function convertGameFormats(oldJson) {
  const conversionPromises = [];

  for (let i = 0; i < oldJson.games.length; i += 1) {
    const game = oldJson.games[i];
    
    /* Don't record scrimmages anymore */
    if (!game.scrimmage) {
      const conversion = convertGame(game);
      conversionPromises.push(conversion);
    }
  }

  Promise.all(conversionPromises)
    .then((games) => {
      const weeks = new Array(19);
    
      for (let i = 0; i < weeks.length; i += 1) {
        weeks[i] = {
          weekNo: i,
          games: [],
        };
      }

      games.forEach((game) => {
        weeks[game.week].games.push(game);
      });

      const seasons = {
        seasons: [
          {
            seasonNo: 1,
            weeks,
          },
        ],
      };

      writeJson(seasons, 'games.json')
        .then((response) => {
          console.log(response);
        })
        .catch(error => console.error(error));
    });
};

convert(fcsJson);
