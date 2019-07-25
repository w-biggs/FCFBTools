const elo = require('../elo.json');
const writeJson = require('./writeJson');

const getTeam = function getTeamFromEloJson(name) {
  return elo.teams.filter(team => team.name === name)[0];
};

const writeSingleElo = function writeSingleTeamElo(name, values) {
  const team = getTeam(name);

  const season = team.seasons.filter(teamSeason => teamSeason.seasonNo === 2)[0];

  season.weeks.push(values);
  team.elo = values.elo;
  
  if (values.gameInfo.result === 'win') {
    team.wins += 1;
  } else if (values.gameInfo.result === 'loss') {
    team.losses += 1;
  } else if (values.gameInfo.result === 'tie') {
    team.ties += 1;
  }
};

const sortElo = function sortEloByElo(a, b) {
  if (a.elo < b.elo) {
    return 1;
  }

  if (a.elo > b.elo) {
    return -1;
  }

  return 0;
};

module.exports = function writeElo(homeName, awayName, eloValues) {
  writeSingleElo(homeName, eloValues.homeValues);
  writeSingleElo(awayName, eloValues.awayValues);
  elo.teams.sort(sortElo);
  writeJson(elo, 'elo.json');
};
