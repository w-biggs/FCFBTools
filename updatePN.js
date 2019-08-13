const teams = require('./config/teams.json');
const games = require('./output/games.json');
const writeJson = require('./utils/writeJson');

/**
 * Round numbers to avoid floating point errors.
 * @param {number} input The number to round.
 * @param {number} places The number of places to round to.
 * @returns {number} The rounded number.
 */
const round = function roundWithoutFloatingPointErrors(input, places) {
  return Number(Number(input).toFixed(places));
};

/**
 * Calculates either the win score or loss score. Win if a is positive, loss if negative.
 *
 * @param {string} teamName The name of the team.
 * @param {number} a The current `a` value.
 * @param {number} baseA The original `a` value.
 * @returns {number} The win or loss score.
 */
const calcScore = function calculateWinOrLossScore(teamName, a, baseA) {
  // Tiny A's are pointless to calculate.
  if (a < 0.0001 && a > -0.0001) {
    return 0;
  }

  // Base score
  let score = 0;

  // Calculate the new A value to use.
  const newA = round(a * baseA, 4);

  games.seasons.forEach((season) => {
    if (season.seasonNo === 2) {
      // Iterate across all s2 games
      season.weeks.forEach((week) => {
        week.games.forEach((game) => {
          // Check whether the game involves this team
          if (game.away.name === teamName || game.home.name === teamName) {
            let gameScore = 0;

            const teamIsHome = game.home.name === teamName;
            const team = teamIsHome ? game.home : game.away;
            const opp = teamIsHome ? game.away : game.home;

            if ((team.score > opp.score && a > 0) || (opp.score > team.score && a < 0)) {
              gameScore += a;
              gameScore += calcScore(opp.name, newA, baseA);
            } else {
              return;
            }
      
            score += gameScore;
          }
        });
      });
    }
  });

  return round(score, 4);
};

/**
 * Generate the PN score for a single team.
 * @param {string} team The team's name.
 */
const generateTeamScore = function generateTeamPNScore(team) {
  /**
  * In their paper, Park and Newman have a complex process using eigenvalues or something
  * to find the optimal value for *a*. But that value hovers around 0.2 for every year they
  * tested, so I'm gonna just use 0.2.
  */
  const baseA = 0.2;

  const w = calcScore(team, 1, baseA);
  const l = calcScore(team, -1, baseA);
  const score = round(w + l, 4);

  console.log(team, w, l, score);

  return { team, score };
};

const results = [];

teams.fcs.forEach((team) => {
  const teamResult = generateTeamScore(team);
  results.push(teamResult);
});

results.sort((a, b) => b.score - a.score);

writeJson(results, 'pn.json');
