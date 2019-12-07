const stats = require('../output/stats.json');
const games = require('../output/games.json');

const teams = [];

for (let i = 0; i < stats.confs.length; i += 1) {
  const conf = stats.confs[i];
  for (let j = 0; j < conf.divs.length; j += 1) {
    const div = conf.divs[j];
    for (let k = 0; k < div.teams.length; k += 1) {
      const team = div.teams[k];
      let pd = 0;
      const opps = [];
      for (let l = 1; l < games.seasons.length; l += 1) {
        const season = games.seasons[l];
        for (let m = 0; m < season.weeks.length; m += 1) {
          const week = season.weeks[m];
          for (let n = 0; n < week.games.length; n += 1) {
            const game = week.games[n];
            if (game.home.name === team.name || game.away.name === team.name) {
              let teamGame;
              let oppGame;
              if (game.home.name === team.name) {
                teamGame = game.home;
                oppGame = game.away;
              } else if (game.away.name === team.name) {
                teamGame = game.away;
                oppGame = game.home;
              }
              opps.push(oppGame.name);
              const gamePd = teamGame.score - oppGame.score;
              pd += gamePd;
              /* if (gamePd > 0) {
                pd += Math.min(24, Math.max(7, gamePd));
              } else {
                pd += Math.max(-24, Math.min(-7, gamePd));
              } */
            }
          }
        }
      }
      const pdg = pd / team.stats.games;
      teams.push({
        name: team.name,
        pdg,
        score: [pdg],
        opps,
      });
    }
  }
}

let scoreSum = 0;
let tempScoreSum = 0;
let i = 0;
do {
  scoreSum = tempScoreSum;
  tempScoreSum = 0;
  for (let j = 0; j < teams.length; j += 1) {
    const team = teams[j];
    let oppScore = 0;
    for (let k = 0; k < team.opps.length; k += 1) {
      const oppName = team.opps[k];
      const opp = teams.filter(oppTeam => oppTeam.name === oppName);
      if (!opp.length) {
        console.error(`Team ${oppName} not found.`);
        process.exit(0);
      } else {
        oppScore += opp[0].score[i];
      }
    }
    team.score[i + 1] = team.pdg + (oppScore / team.opps.length);
    /* if (team.name === 'Penn') {
      console.log(`${team.name}: ${team.score[team.score.length - 1]}`);
    } */
    tempScoreSum += team.score[i + 1];
  }
  i += 1;
} while (tempScoreSum - scoreSum !== 0);


for (let j = 0; j < teams.length; j += 1) {
  const team = teams[j];
  console.log(`${team.name}, ${team.score[team.score.length - 1]}`);
}
