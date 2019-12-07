const teams = require('./config/teams.json');
const writeJson = require('./utils/writeJson');
const { generateTeamScore } = require('./utils/calcPN');

const results = [];

const weightedResults = [];

teams.fcs.forEach((team) => {
  const teamResult = generateTeamScore(team);
  console.log(teamResult.team, teamResult.w, teamResult.l, teamResult.score);
  results.push(teamResult);
});

results.sort((a, b) => b.score - a.score);

teams.fcs.forEach((team) => {
  const teamResult = generateTeamScore(team, undefined, undefined, 0.25);
  console.log(teamResult.team, teamResult.w, teamResult.l, teamResult.score);
  weightedResults.push(teamResult);
});

results.sort((a, b) => b.score - a.score);

weightedResults.sort((a, b) => b.score - a.score);

writeJson(results, 'pn.json')
  .then((response) => {
    console.log(response);
  })
  .catch(error => console.error(error));

writeJson(weightedResults, 'wpn.json')
  .then((response) => {
    console.log(response);
  })
  .catch(error => console.error(error));
