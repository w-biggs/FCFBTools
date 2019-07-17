const getTeamSeasonWeekElo = function getTeamEloGivenSeasonAndWeek(team, seasonNo, weekNo) {
  const season = team.seasons.find(teamSeason => teamSeason.seasonNo === seasonNo);
  if (!season) { // Season not found
    return false;
  }
  const week = season.weeks.find(teamWeek => teamWeek.weekNo === weekNo);
  if (!week) {
    return false;
  }
  return week.elo;
};

const getSeasonWeekElos = function getAllTeamElosGivenSeasonAndWeek(elo, seasonNo, weekNo) {
  const elos = elo.teams.map(team => getTeamSeasonWeekElo(team, seasonNo, weekNo));
  return elos.filter(teamElo => teamElo);
};

module.exports = function calculateSeasonRanges(elo, seasonNo) {
  const ranges = [];
  
  /* Number of games found for a week */
  let weekNo = 0;
  let gameCount = 0;
  
  do {
    const elos = getSeasonWeekElos(elo, seasonNo, weekNo);

    if (elos.length > 0) {
      const minElo = elos.reduce((a, b) => Math.min(a, b));
      const maxElo = elos.reduce((a, b) => Math.max(a, b));

      ranges.push([minElo, maxElo]);
    }

    gameCount = elos.length;
    weekNo += 1; // iterate week
  } while (gameCount !== 0);

  return ranges;
};
