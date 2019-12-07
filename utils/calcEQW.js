const elo = require('../output/elo.json');

/**
 * Get the number of wins for a team in a season up to and including the given week.
 * @param {String} teamName The name of the team.
 * @param {Number} seasonNo The season number to get wins for.
 * @param {Number} weekNo The week number to get wins up to & including.
 */
const getTeamRecord = function getTeamRecordUpToWeek(teamName, seasonNo, weekNo) {
  const teamResult = elo.teams.filter(filterTeam => filterTeam.name === teamName);
  if (teamResult.length) {
    const team = teamResult[0];
    const seasonResult = team.seasons.filter(filterSeason => filterSeason.seasonNo === seasonNo);
    if (seasonResult.length) {
      let wins = 0;
      let losses = 0;
      for (let i = 0; i < seasonResult[0].weeks.length; i += 1) {
        const week = seasonResult[0].weeks[i];
        if (week.weekNo <= weekNo && week.gameInfo) {
          if (week.gameInfo.result === 'win') {
            wins += 1;
          } else if (week.gameInfo.result === 'loss') {
            losses += 1;
          }
        }
      }
      return [wins, losses];
    }
    console.error(`Season ${seasonNo} not found.`);
    return false;
  }
  console.error(`Team ${teamName} not found.`);
  return false;
};

/**
 * Get the raw gained wins/losses for a team in a season up to and including the given week.
 * @param {String} teamName The name of the team.
 * @param {Number} seasonNo The season number to get wins for.
 * @param {Number} weekNo The week number to get wins up to & including.
 */
const getTeamRawGainedWL = function getTeamRawGainedWinsAndLosses(teamName, seasonNo, weekNo) {
  const teamResult = elo.teams.filter(filterTeam => filterTeam.name === teamName);
  if (teamResult.length) {
    const team = teamResult[0];
    const seasonResult = team.seasons.filter(filterSeason => filterSeason.seasonNo === seasonNo);
    if (seasonResult.length) {
      const gained = []; // Contains the gained wins/losses for each week
      for (let i = 0; i < seasonResult[0].weeks.length; i += 1) {
        const week = seasonResult[0].weeks[i];
        if (week.weekNo <= weekNo && week.gameInfo) {
          const oppRecord = getTeamRecord(week.gameInfo.oppName, seasonNo, weekNo);
          /* console.log(
            week.gameInfo.oppName,
            oppRecord,
          ); */
          if (week.gameInfo.result === 'win') {
            gained.push(oppRecord[0] + 0.1);
          } else if (week.gameInfo.result === 'loss') {
            gained.push(-0.1 - oppRecord[1]);
          }
        }
      }
      return gained.reduce((total, weekGained) => total + weekGained) / gained.length;
    }
    console.error(`Season ${seasonNo} not found.`);
    return false;
  }
  console.error(`Team ${teamName} not found.`);
  return false;
};

/**
 * Get the average opponent raw gained wins/losses for a team in a season up to and including the
 * given week.
 * @param {String} teamName The name of the team.
 * @param {Number} seasonNo The season number to get wins for.
 * @param {Number} weekNo The week number to get wins up to & including.
 */
const getTeamAvgOppRaw = function getTeamAvgOppRawGainedWinsAndLosses(teamName, seasonNo, weekNo) {
  const teamResult = elo.teams.filter(filterTeam => filterTeam.name === teamName);
  if (teamResult.length) {
    const team = teamResult[0];
    const seasonResult = team.seasons.filter(filterSeason => filterSeason.seasonNo === seasonNo);
    if (seasonResult.length) {
      const oppRaws = []; // Contains the gained wins/losses for each week
      for (let i = 0; i < seasonResult[0].weeks.length; i += 1) {
        const week = seasonResult[0].weeks[i];
        if (week.weekNo <= weekNo && week.gameInfo) {
          const oppRaw = getTeamRawGainedWL(week.gameInfo.oppName, seasonNo, weekNo);
          /* console.log(
            week.gameInfo.oppName,
            oppRaw,
          ); */
          oppRaws.push(oppRaw);
        }
      }
      return oppRaws.reduce((total, weekRaw) => total + weekRaw) / oppRaws.length;
    }
    console.error(`Season ${seasonNo} not found.`);
    return false;
  }
  console.error(`Team ${teamName} not found.`);
  return false;
};

const getAvgOppRawStats = function getAvgOppRawStats(seasonNo, weekNo) {
  const avgOppRaws = [];

  for (let i = 0; i < elo.teams.length; i += 1) {
    avgOppRaws.push(getTeamAvgOppRaw(elo.teams[i].name, seasonNo, weekNo));
  }
  
  const avgOppRawAvg = avgOppRaws.reduce((total, avgOppRaw) => total + avgOppRaw)
    / avgOppRaws.length;
  
  const avgOppRawSqDiffs = avgOppRaws.map(value => (value - avgOppRawAvg) ** 2);
  
  const avgOppRawStDev = Math.sqrt(avgOppRawSqDiffs.reduce((total, avgOppRaw) => total + avgOppRaw)
    / (avgOppRawSqDiffs.length - 1));

  return [avgOppRawAvg, avgOppRawStDev];
};

const getTeamEQW = function getTeamEquivalentWins(teamName, seasonNo, weekNo, avgOppRawStats) {
  const teamResult = elo.teams.filter(filterTeam => filterTeam.name === teamName);
  if (teamResult.length) {
    const team = teamResult[0];
    const seasonResult = team.seasons.filter(filterSeason => filterSeason.seasonNo === seasonNo);
    if (seasonResult.length) {
      const modGained = []; // Contains the modified gained wins/losses for each week
      for (let i = 0; i < seasonResult[0].weeks.length; i += 1) {
        const week = seasonResult[0].weeks[i];
        if (week.weekNo <= weekNo && week.gameInfo) {
          const oppRecord = getTeamRecord(week.gameInfo.oppName, seasonNo, weekNo);
          let rawGained = 0;

          if (week.gameInfo.result === 'win') {
            rawGained = oppRecord[0] + 0.1;
          } else if (week.gameInfo.result === 'loss') {
            rawGained = -0.1 - oppRecord[1];
          }

          const oppAvgOppRaw = getTeamAvgOppRaw(week.gameInfo.oppName, seasonNo, weekNo);
          const modifier = ((oppAvgOppRaw - avgOppRawStats[0]) / avgOppRawStats[1]) / Math.PI;
          // console.log(week.gameInfo.oppName, oppRecord, rawGained, modifier);
          modGained.push(rawGained + modifier);
        }
      }
      /* if (teamName === 'Norfolk State') {
        console.log(modGained);
      } */
      // console.log(modGained);
      return modGained.reduce((total, weekModGained) => total + weekModGained) / modGained.length;
    }
    console.error(`Season ${seasonNo} not found.`);
    return false;
  }
  console.error(`Team ${teamName} not found.`);
  return false;
};

const getAllEQW = function getAllTeamEQWs(seasonNo, weekNo = 999) {
  const avgOppRawStats = getAvgOppRawStats(seasonNo, weekNo);

  const teams = [];

  for (let i = 0; i < elo.teams.length; i += 1) {
    const team = elo.teams[i];
    teams.push({
      team: team.name,
      eqw: getTeamEQW(team.name, seasonNo, weekNo, avgOppRawStats),
    });
  }

  // console.log(avgOppRawStats);

  return teams;
};

module.exports = {
  getAllEQW,
};
