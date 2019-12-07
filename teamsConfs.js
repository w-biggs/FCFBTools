const elo = require('./output/elo.json');
const writeJson = require('./utils/writeJson');

const confs = {
  confs: [],
};

for (let i = 0; i < elo.teams.length; i += 1) {
  const team = elo.teams[i];
  let confFound = false;
  for (let j = 0; j < confs.confs.length; j += 1) {
    const conf = confs.confs[j];
    if (conf && conf.name === team.fullConf) {
      confFound = true;
      let divFound = false;
      for (let k = 0; k < conf.divs.length; k += 1) {
        const div = conf.divs[k];
        if (div && div.name === team.div) {
          divFound = true;
          div.teams.push(team.name);
        }
      }
      if (!divFound) {
        conf.divs.push({
          name: team.div,
          teams: [team.name],
        });
      }
    }
  }
  if (!confFound) {
    confs.confs.push({
      name: team.fullConf,
      divs: [{
        name: team.div,
        teams: [team.name],
      }],
    });
  }
}

writeJson(confs, 'teamsConfs.json');
