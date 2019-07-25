/**
 * Advance to the next season and regress all Elo scores.
 */

const fs = require('fs');
const oldElo = require('./elo.json');
const calcRange = require('./utils/calcRange');
const writeJson = require('./utils/writeJson');

const regressElo = function regressTeamElo(elo) {
  return elo + ((1500 - elo) / 3);
};

const addTeamSeason = function addNextSeasonToTeamSeasons(elo, seasons, seasonNo) {
  return [
    ...seasons,
    {
      seasonNo,
      weeks: [
        {
          weekNo: 0,
          elo,
        },
      ],
    },
  ];
};

const advanceTeam = function advanceTeamSeason(team, seasonNo) {
  const elo = regressElo(team.elo);
  return {
    ...team,
    elo,
    seasons: addTeamSeason(elo, team.seasons, seasonNo),
  };
};

const addSeason = function addseasonNo(elo, newElo, seasonNo) {
  return [
    ...elo.seasons,
    {
      seasonNo,
      weeks: [
        {
          weekNo: 0,
          name: `Start of FCS Season ${seasonNo}`,
          range: calcRange(newElo, seasonNo, 0),
        },
      ],
    },
  ];
};

const advance = function advanceSeason(elo) {
  const seasonNo = Math.max.apply(null, elo.seasons.map(season => season.seasonNo)) + 1;

  const newElo = {
    teams: [],
    seasons: [],
  };
  newElo.teams = elo.teams.map(team => advanceTeam(team, seasonNo));
  newElo.seasons = addSeason(oldElo, newElo, seasonNo);
  return newElo;
};

const newElo = advance(oldElo);

writeJson(newElo, 'elo2.json');
