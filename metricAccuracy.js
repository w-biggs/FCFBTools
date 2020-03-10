const { generateTeamScore } = require('./utils/calcPN');
const games = require('./output/games.json');
const elo = require('./output/elo.json');
const coachElo = require('./output/coachElo.json');

let correct = 0;
let total = 0;

let eloCorrect = 0;
let eloTotal = 0;

let coachEloCorrect = 0;
let coachEloTotal = 0;

const findElo = function findElo(teamName, seasonNo, weekNo) {
  for (let i = 0; i < elo.teams.length; i += 1) {
    const team = elo.teams[i];
    if (team.name === teamName) {
      for (let j = 0; j < team.seasons.length; j += 1) {
        const season = team.seasons[j];
        if (season.seasonNo === seasonNo) {
          for (let k = 0; k < season.weeks.length; k += 1) {
            const week = season.weeks[k];
            if (week.weekNo === weekNo) {
              return [week.prevElo, week.oppElo];
            }
          }
        }
      }
    }
  }
  return false;
};

const findCoachElo = function findCoachElo(coachName, seasonNo, weekNo) {
  for (let i = 0; i < coachElo.length; i += 1) {
    const coach = coachElo[i];
    if (coach.name === coachName) {
      for (let j = 0; j < coach.games.length; j += 1) {
        const game = coach.games[j];
        if (game.season === seasonNo && game.week === weekNo) {
          return game.prev;
        }
      }
    }
  }
  return false;
};

for (let i = 1; i < 2; i += 1) {
  const season = games.seasons[i];
  // Skip the first week of the season
  for (let j = 0; j < season.weeks.length; j += 1) {
    const week = season.weeks[j];
    console.log(`Season ${season.seasonNo}, Week ${week.weekNo}`);
    for (let k = 0; k < week.games.length; k += 1) {
      const game = week.games[k];
      /* const movInfluence = 0.25;
      const homeScore = generateTeamScore(game.home.name, season.seasonNo, week.weekNo - 1,
        movInfluence);
      const awayScore = generateTeamScore(game.away.name, season.seasonNo, week.weekNo - 1,
        movInfluence); */
      const elos = findElo(game.home.name, season.seasonNo, week.weekNo);
      const homePlays = Object.keys(game.home.users).reduce((a, b) => a + game.home.users[b], 0);
      // eslint-disable-next-line arrow-body-style
      const homeCoachElo = Object.keys(game.home.users).reduce((a, b) => {
        return a + (
          findCoachElo(b, season.seasonNo, week.weekNo) * (game.home.users[b] / homePlays)
        );
      }, 0);
      const awayPlays = Object.keys(game.away.users).reduce((a, b) => a + game.away.users[b], 0);
      // eslint-disable-next-line arrow-body-style
      const awayCoachElo = Object.keys(game.away.users).reduce((a, b) => {
        return a + (
          findCoachElo(b, season.seasonNo, week.weekNo) * (game.away.users[b] / awayPlays)
        );
      }, 0);
      console.log(`${game.home.name} ${game.home.score} (${elos[0]}, ${homeCoachElo}) - ${game.away.name} ${game.away.score} (${elos[1]}, ${awayCoachElo})`);

      // Ties don't matter
      /* if (!((game.home.score === game.away.score) || (homeScore.score === awayScore.score))) {
        // Check if PN was correct
        if (((game.home.score > game.away.score) && (homeScore.score > awayScore.score))
          || ((game.home.score < game.away.score) && (homeScore.score < awayScore.score))) {
          correct += 1;
          total += 1;
        } else {
          total += 1;
        }
      } */
      // Check if Elo was correct
      if (!((game.home.score === game.away.score) || (elos[0] === elos[1]))) {
        if (((game.home.score > game.away.score) && (elos[0] > elos[1]))
          || ((game.home.score < game.away.score) && (elos[0] < elos[1]))) {
          eloCorrect += 1;
          eloTotal += 1;
        } else {
          eloTotal += 1;
        }
      }
      // Check if coach Elo was correct
      if (!((game.home.score === game.away.score) || (homeCoachElo === awayCoachElo))) {
        if (((game.home.score > game.away.score) && (homeCoachElo > awayCoachElo))
          || ((game.home.score < game.away.score) && (homeCoachElo < awayCoachElo))) {
          coachEloCorrect += 1;
          coachEloTotal += 1;
        } else {
          coachEloTotal += 1;
        }
      }
    }
  }
}

// console.log(`wP-N: ${correct}/${total} correct, ${(Math.round(((correct / total) * 10000)) / 100)}% accuracy`);
console.log(`elo: ${eloCorrect}/${eloTotal} correct, ${(Math.round(((eloCorrect / eloTotal) * 10000)) / 100)}% accuracy`);
console.log(`coach elo: ${coachEloCorrect}/${coachEloTotal} correct, ${(Math.round(((coachEloCorrect / coachEloTotal) * 10000)) / 100)}% accuracy`);
