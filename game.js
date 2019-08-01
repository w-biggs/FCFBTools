const readline = require('readline');
const { fetchJson } = require('./utils/fetchJson');
const parseGame = require('./utils/parseGame');
const calcElo = require('./utils/calcElo');
const writeElo = require('./utils/writeElo');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const requestID = function askUserToInputGameID() {
  return new Promise((resolve, reject) => {
    rl.question('What game ID should be applied to the Elo? ', (answer) => {
      if (!answer) {
        reject(new Error('Invalid game ID.'));
      }
      resolve(answer);
    });
  });
};

requestID()
  .then((gameID) => {
    rl.close();
    fetchJson(gameID, true)
      .then((response) => {
        const game = parseGame(response.json);
        const eloValues = calcElo(game);
        writeElo(game.home.name, game.away.name, eloValues);
      })
      .catch((error) => {
        console.error(error);
      });
  })
  .catch((error) => {
    console.error(error);
  });

// writeJson(newElo, 'elo2.json');
