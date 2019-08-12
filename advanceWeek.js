const https = require('https');
const fs = require('fs');
const readline = require('readline');
const elo = require('./output/elo.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = function ask(response) {
  return new Promise((resolve, reject) => {
    const { json, name } = response;

    const { children } = json.data;

    if (children.length > 1) {
      let question = `Which game to use for ${name}?\n`;
      const ids = new Array(children.length);
      children.forEach((child, i) => {
        ids[i] = child.data.id;
        question += `${i}: ${child.data.title}\n`;
      });

      rl.question(question, (answer) => {
        if (answer === 'n') {
          resolve();
          return;
        }
        const answerInt = parseInt(answer, 10);
        if (Number.isNaN(answerInt)) {
          reject(new Error(`${answer} is not an integer.`));
          return;
        }
        if (!(answerInt in children)) {
          reject(new Error(`${answerInt} is not a valid choice.`));
          return;
        }
        console.log(`resolving q with ${answerInt}`);
        resolve(children[answerInt].data.id);
      });
    } else if (children.length === 0) {
      console.log(`no game found for ${name}.`);
      resolve();
    } else {
      console.log(`resolving no-q with ${children.length} children`);
      if (!children[0].data.id) {
        console.log(children[0].data);
      }
      resolve(children[0].data.id);
    }
  });
};

const getID = function getGameIDForTeam(teamName) {
  return new Promise((resolve, reject) => {
    const url = `https://www.reddit.com/r/FakeCollegeFootball/search.json?q=-flair:%22Post+Game+Thread%22%20title:%22${teamName}%22&sort=new&restrict_sr=on&limit=100&t=day`;
  
    const request = https.get(url, (response) => {
      // Handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error(`Failed to load page, status code: ${response.statusCode}`));
      }

      // Temporary data holder
      const body = [];

      // Push chunks to the body array
      response.on('data', chunk => body.push(chunk));

      response.on('end', () => resolve({
        json: JSON.parse(body.join('')),
        name: teamName,
      }));
    });
    // Handle connection errors
    request.on('error', err => reject(err));
  });
};

const filterIDs = async function filterIDsAndAskIfMultiple(responses) {
  const ids = [];

  console.log(responses.length);

  for (let i = 0; i < responses.length; i += 1) {
    const response = responses[i];
    /* eslint-disable-next-line no-await-in-loop */
    const id = await ask(response);
    ids.push(id);
  }

  rl.close();

  return ids;
};

const doTeamIDs = async function getTeamIDs(teams) {
  const requests = [];

  teams.forEach((team) => {
    const request = getID(team.name);
    requests.push(request);
  });

  try {
    const responses = await Promise.all(requests);
    return filterIDs(responses);
  } catch (error) {
    return error;
  }
};

const writeGames = function writeGamesToFile(games) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      './output/gameIDs.json',
      JSON.stringify(games, null, 2),
      (writeErr) => {
        if (writeErr) {
          reject(writeErr);
        } else {
          console.log('Wrote to ./output/gameIDs.json.');
          resolve();
        }
      },
    );
  });
};

doTeamIDs(elo.teams)
  .then((ids) => {
    console.log(ids);
    writeGames([...new Set(ids)]);
  })
  .catch((error) => {
    console.error(error);
  });
