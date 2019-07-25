const mathjs = require('mathjs');
const elo = require('../elo.json');

/* Vegas line divisor - (Elo - Opp Elo / x). */
const vegasDivisor = 18.14010981807;

/* MOV Standard Deviation - MOVs' standard deviation from the vegas line */
const movStdev = 15.61;

/* K value */
const kval = 20;

const cdfNormal = function normalCumulativeDistributionFunction(x, mean, stdev) {
  return (1 - mathjs.erf((mean - x) / (Math.sqrt(2) * stdev))) / 2;
};

/* P-F-R method - see https://www.pro-football-reference.com/about/win_prob.htm */
const calcWinProb = function calculateWinProbability(
  teamScore, oppScore, teamElo, oppElo, minsPlayed,
) {
  const oppMargin = oppScore - teamScore;
  const inverseVegasLine = (teamElo - oppElo) / vegasDivisor;
  const minsRemaining = (28 - minsPlayed);

  const winDist = cdfNormal((oppMargin + 0.5),
    (inverseVegasLine * (minsRemaining / 28)),
    (movStdev / Math.sqrt(28 / minsRemaining)));

  const lossDist = cdfNormal((oppMargin - 0.5),
    (inverseVegasLine * (minsRemaining / 28)),
    (movStdev / Math.sqrt(28 / minsRemaining)));

  const winProb = ((1 - winDist) + (0.5 * (winDist - lossDist)));

  return winProb;
};

const calcMovMultiplier = function calculateMarginOfVictoryMultiplier(scoreDiff, winnerEloDiff) {
  return Math.log(Math.abs(scoreDiff) + 1) * (2.2 / ((winnerEloDiff * 0.001) + 2.2));
};

/* don't calculate this every time */
const expNormalizer = (1 - Math.exp(0 - (28 / 2))) * 2;

const calcEloChange = function calculateEloChange(
  minsPlayed, teamWinProb, movMultiplier, expectedTeamWinProb,
) {
  /* deweight Elo changes for games with very short lengths */
  const expDeweight = (((1 - Math.exp(0 - (minsPlayed / 2))) * 2) / expNormalizer);

  /* difference between result and expected result */
  const diffFromExpected = teamWinProb - expectedTeamWinProb;

  return expDeweight * movMultiplier * kval * diffFromExpected;
};

const getElo = function getEloFromEloJson(name) {
  return elo.teams.filter(team => team.name === name)[0].elo;
};

module.exports = function calcElo(game) {
  /* Cap at 28 for overtime games */
  const mins = Math.min(game.gameLength / 60, 28);

  /* Get integer scores */
  const homeScore = parseInt(game.home.score, 10);
  const awayScore = parseInt(game.away.score, 10);

  /* find Elo scores */
  const homeElo = getElo(game.home.name);
  const awayElo = getElo(game.away.name);

  let winnerEloDiff = 0;
  let homeResult = 0;
  let awayResult = 0;

  if (homeScore > awayScore) {
    winnerEloDiff = homeElo - awayElo;
    homeResult = 1;
    awayResult = -1;
  } else if (awayScore > homeScore) {
    winnerEloDiff = awayElo - homeElo;
    homeResult = -1;
    awayResult = 1;
  }

  const homeWinProb = calcWinProb(homeScore, awayScore, homeElo, awayElo, mins);

  const movMultiplier = calcMovMultiplier(homeScore - awayScore, winnerEloDiff);

  /* 0 score diff and 0 minutes played = pre-game odds */
  const expectedHomeWinProb = calcWinProb(0, 0, homeElo, awayElo, 0);

  const homeEloChange = calcEloChange(mins, homeWinProb, movMultiplier, expectedHomeWinProb);

  const awayEloChange = 0 - homeEloChange;

  const newHomeElo = homeElo + homeEloChange;

  const newAwayElo = awayElo + awayEloChange;

  const homeValues = {
    weekNo: game.week,
    prevElo: homeElo,
    oppElo: awayElo,
    mins,
    winProb: homeWinProb,
    movMultiplier,
    expectedWinProb: expectedHomeWinProb,
    eloChange: homeEloChange,
    elo: newHomeElo,
    gameInfo: {
      result: homeResult,
      score: homeScore,
      oppScore: awayScore,
      oppName: game.away.name,
    },
  };
  
  const awayValues = {
    weekNo: game.week,
    prevElo: awayElo,
    oppElo: homeElo,
    mins,
    winProb: 1 - homeWinProb,
    movMultiplier,
    expectedWinProb: 1 - expectedHomeWinProb,
    eloChange: awayEloChange,
    elo: newAwayElo,
    gameInfo: {
      result: awayResult,
      score: awayScore,
      oppScore: homeScore,
      oppName: game.home.name,
    },
  };

  return {
    homeValues,
    awayValues,
  };
};
