const fs = require('fs');
const teamsConfs = require('./output/teamsConfs.json');
const elo = require('./output/elo.json');
const pn = require('./output/pn.json');

const results = [['Conference,Division,Min Elo,Max Elo,Avg Elo,Min P-N,Max P-N,Avg P-N']];

for (let i = 0; i < teamsConfs.confs.length; i += 1) {
  const conf = teamsConfs.confs[i];
  for (let j = 0; j < conf.divs.length; j += 1) {
    const div = conf.divs[j];
    let minElo = 1500;
    let maxElo = 1500;
    let eloSum = 0;
    let minPN = 0;
    let maxPN = 0;
    let PNSum = 0;
    let teamCount = 0;
    for (let k = 0; k < elo.teams.length; k += 1) {
      const team = elo.teams[k];
      if (team.fullConf === conf.name && team.div === div.name) {
        if (team.elo < minElo) {
          minElo = team.elo;
        }
        if (team.elo > maxElo) {
          maxElo = team.elo;
        }
        let teamPN = 0;
        for (let l = 0; l < pn.length; l += 1) {
          const pnTeam = pn[l];
          if (pnTeam.team === team.name) {
            teamPN = pnTeam.score;
          }
        }
        if (teamPN === 0) {
          console.log(team.name);
        }
        if (teamPN < minPN) {
          minPN = teamPN;
        }
        if (teamPN > maxPN) {
          maxPN = teamPN;
        }
        PNSum += teamPN;
        eloSum += team.elo;
        teamCount += 1;
      }
    }
    results.push(`${conf.name}, ${div.name}, ${minElo}, ${maxElo}, ${eloSum / teamCount}, ${minPN}, ${maxPN}, ${PNSum / teamCount}`);
  }
}

fs.writeFile('./output/avgs.csv', results.join('\n'), (err) => {
  if (err) {
    console.error(err);
  }
  console.log('./output/avgs.csv has successfully been written.');
});
