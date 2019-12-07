const games = require('../output/games.json');
const avgScore = require('./avgScore');

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
 * Calculate the MoV modifier to add to the closeness score.
 * @param {number} mov The margin of victory.
 * @param {number} movInfluence The amount of influence the MoV has in the a score.
 * @param {number} movMultiplier The amount to multiply ln(MoV) by to fit it to the influence.
 * @returns {number} The calculated MoV modifier.
 */
const calcMoVModifier = function calculateMarginOfVictoryModifier(mov, movInfluence,
  movMultiplier) {
  return (0 - movInfluence) + (Math.log(mov + 1) * movMultiplier);
};

/**
 * Calculates either the win score or loss score. Win if a is positive, loss if negative.
 *
 * @param {string} teamName The name of the team.
 * @param {number} a The current `a` value.
 * @param {number} baseA The original `a` value.
 * @param {number} seasonNo The season to calculate the score for.
 * @param {number} maxWeek The week to calculate the score up to.
 * @param {number} movInfluence The amount of influence the MoV has in the a score.
 * @param {number} movMultiplier The amount to multiply ln(MoV) by to fit it to the influence.
 * @returns {number} The win or loss score.
 */
const calcScore = function calculateWinOrLossScore(teamName, a, baseA,
  seasonNo = 2, maxWeek = false, movInfluence = 0, movMultiplier = false) {
  // Tiny A's are pointless to calculate.
  if (a < 0.0001 && a > -0.0001) {
    return 0;
  }

  // Base score
  let score = 0;

  // Calculate the new A value to use.
  const newA = round(a * baseA, 4);

  games.seasons.forEach((season) => {
    if (season.seasonNo === seasonNo) {
      // Iterate across all season games
      season.weeks.forEach((week) => {
        week.games.forEach((game) => {
          // Check whether game is allowed for the given week.
          if ((maxWeek !== false && game.week <= maxWeek) || maxWeek === false) {
            // Check whether the game involves this team
            if (game.away.name === teamName || game.home.name === teamName) {
              let gameScore = 0;
  
              const teamIsHome = game.home.name === teamName;
              const team = teamIsHome ? game.home : game.away;
              const opp = teamIsHome ? game.away : game.home;
  
              if ((team.score > opp.score && a > 0) || (opp.score > team.score && a < 0)) {
                gameScore += a;
                if (movInfluence > 0) {
                  const movModifier = calcMoVModifier(Math.abs(team.score - opp.score),
                    movInfluence, movMultiplier);
                  gameScore += (a * movModifier);
                }
                gameScore += calcScore(opp.name, newA, baseA, seasonNo, maxWeek,
                  movInfluence, movMultiplier);
              } else {
                return;
              }
        
              score += gameScore;
            }
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
 * @param {number} seasonNo The season to calculate the score for.
 * @param {number} maxWeek The week to calculate the score up to.
 * @param {number} movInfluence The amount of influence the MoV has in the a score.
 */
const generateTeamScore = function generateTeamPNScore(team, seasonNo = 2, maxWeek = false,
  movInfluence = 0) {
  /**
  * In their paper, Park and Newman have a complex process using eigenvalues or something
  * to find the optimal value for *a*. But that value hovers around 0.2 for every year they
  * tested, so I'm gonna just use 0.2.
  */
  const baseA = 0.2;
  
  // Calculate the MoV multiplier to fit the modifiers to the given amount of influence.
  const movMultiplier = movInfluence ? (movInfluence / Math.log(avgScore().medMov + 1)) : false;

  const w = calcScore(team, 1, baseA, seasonNo, maxWeek, movInfluence, movMultiplier);
  const l = calcScore(team, -1, baseA, seasonNo, maxWeek, movInfluence, movMultiplier);
  const score = round(w + l, 4);

  return {
    team,
    score,
    w,
    l,
  };
};

module.exports = {
  generateTeamScore,
};
