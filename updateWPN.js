const teams = require('./config/teams.json');
const writeJson = require('./utils/writeJson');
const { generateTeamScore } = require('./utils/calcPN');

const results = [];

for (let i = 0; i < teams.fcs.length; i += 1) {
  const team = teams.fcs[i];
  const teamResult = generateTeamScore(team, undefined, undefined, 0.25);
  results.push(teamResult);
  process.stdout.write(`${i}/${teams.fcs.length}`);
}

results.sort((a, b) => b.score - a.score);

writeJson(results, 'wpn.json')
  .then((response) => {
    process.stdout.write(response);
  })
  .catch(error => process.stderr.write(error));
