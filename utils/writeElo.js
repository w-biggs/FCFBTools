const elo = require('../output/elo.json');
const writeJson = require('./writeJson');

/**
 * Find the given team in the elo.json file and return that team's info.
 *
 * @param {string} name - The name of the team to get from the Elo.
 */
const getTeam = function getTeamFromEloJson(name) {
  return elo.teams.filter(team => team.name === name)[0];
};

/**
 * Update a single team's Elo in the elo.json file.
 *
 * @param {string} name - The name of the team whose Elo we're writing.
 * @param {Object} values - The values to write.
 */
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

/**
 * Sort the elo.json file by team Elo.
 *
 * @param {Object} a - A team in the elo.json file.
 * @param {Object} b - A team in the elo.json file.
 */
const sortElo = function sortEloByElo(a, b) {
  if (a.elo < b.elo) {
    return 1;
  }

  if (a.elo > b.elo) {
    return -1;
  }

  return 0;
};
/**
 * Filter an array of seasons by their seasonNo.
 *
 * @param {Object[]} seasons - The seasons to filter.
 * @param {number} seasonNo - The season number to filter by.
 */
const filterSeasons = function filterSeasonsBySeasonNo(seasons, seasonNo) {
  return seasons.filter(season => season.seasonNo === seasonNo)[0];
};

/**
 * Filter an array of weeks by their weekNo.
 *
 * @param {Object[]} weeks - The weeks to filter.
 * @param {number} weekNo - The week number to filter by.
 */
const filterWeeks = function filterWeeksByWeekNo(weeks, weekNo) {
  return weeks.filter(week => week.weekNo === weekNo)[0];
};

/**
 * Update the elo.json ranges for the given week.
 *
 * @param {number[]} weekNos - An array of week numbers to update the ranges for.
 * @param {Object} eloJson - The elo.json.
 */
const eloRanges = function updateEloRanges(seasonNo, weekNos, eloJson) {
  weekNos.forEach((weekNo) => {
    // Min and max will be <> 1500.
    let minElo = 1500;
    let maxElo = 1500;

    // Loop through all teams.
    for (let i = 0; i < eloJson.teams.length; i += 1) {
      const team = eloJson.teams[i];
      const season = filterSeasons(team.seasons, seasonNo);

      // Find last week with an Elo.
      let teamWeekNo = weekNo;
      let week = filterWeeks(season.weeks, teamWeekNo);

      while (typeof week === 'undefined' && teamWeekNo >= 0) {
        teamWeekNo -= 1;
        week = filterWeeks(season.weeks, teamWeekNo);
      }

      if (typeof week !== 'undefined') {
        if (week.elo > maxElo) {
          maxElo = week.elo;
        }
        if (week.elo < minElo) {
          minElo = week.elo;
        }
      }
    }

    const season = eloJson.seasons.filter(seasonJson => seasonJson.seasonNo === seasonNo)[0];
    const weeks = season.weeks.filter(weekJson => weekJson.weekNo === weekNo);
    if (!weeks.length) {
      season.weeks.push({
        weekNo,
        name: false,
        range: [
          minElo,
          maxElo,
        ],
      });
    } else {
      weeks[0].range = [
        minElo,
        maxElo,
      ];
    }
  });

  return eloJson;
};

/**
 * Write the elo values for both teams in a game.
 *
 * @param {string} homeName - The name of the home team.
 * @param {string} awayName - The name of the away team.
 * @param {Object} eloValues - The elo values to write.
 */
const writeElo = function writeSingleGameElo(homeName, awayName, eloValues) {
  const { weekNo } = eloValues.homeValues;
  writeSingleElo(homeName, eloValues.homeValues);
  writeSingleElo(awayName, eloValues.awayValues);
  elo.teams.sort(sortElo);
  const rangedElo = eloRanges(2, [weekNo], elo);
  writeJson(rangedElo, 'elo.json');
};

/**
 * Write elo values for multiple games to elo.json.
 *
 * @param {Object[]} games - The games to write to elo.json.
 */
const writeElos = function writeMultipleGameElos(games) {
  const weekNos = [];
  games.forEach((game) => {
    weekNos.push(game.eloValues.homeValues.weekNo);
    writeSingleElo(game.homeName, game.eloValues.homeValues);
    writeSingleElo(game.awayName, game.eloValues.awayValues);
  });
  elo.teams.sort(sortElo);
  const rangedElo = eloRanges(2, weekNos, elo);
  writeJson(rangedElo, 'elo.json');
};

const updateRange = function updateEloRangeAndWrite(seasonNo, weekNo) {
  const rangedElo = eloRanges(seasonNo, [weekNo], elo);
  writeJson(rangedElo, 'elo.json');
};

module.exports = {
  writeElo,
  writeElos,
  updateRange,
};
