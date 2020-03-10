/* eslint-disable max-len */
const teams = require('./output/teamsConfs.json');
const games = require('./output/games.json');
const writeJson = require('./utils/writeJson');

const confs = [];

const oocWeeks = [1, 2, 5, 8];

const getTeamDivConf = function getTeamDivisionAndConference(teamName) {
  for (let i = 0; i < teams.confs.length; i += 1) {
    const conf = teams.confs[i];
    for (let j = 0; j < conf.divs.length; j += 1) {
      const div = conf.divs[j];
      for (let k = 0; k < div.teams.length; k += 1) {
        const team = div.teams[k];
        if (team === teamName) {
          return {
            conf: conf.name,
            div: div.name,
          };
        }
      }
    }
  }
  return false;
};

const headToHead = function headToHead(teamA, teamB) {
  const foundGames = [];
  games.seasons.forEach((season) => {
    if (season.seasonNo === 2) {
      // Iterate across all s2 games
      season.weeks.forEach((week) => {
        week.games.forEach((game) => {
          // Check whether the game involves both teams
          if ((game.away.name === teamA && game.home.name === teamB)
            || (game.home.name === teamA && game.away.name === teamB)) {
            foundGames.push(game);
          }
        });
      });
    }
  });
  const record = [0, 0]; // team A wins, team B wins
  if (foundGames) {
    foundGames.forEach((game) => {
      if (game.home.name === teamA) {
        record[0] += game.home.score > game.away.score ? 1 : 0;
        record[1] += game.home.score < game.away.score ? 1 : 0;
      } else {
        record[0] += game.home.score < game.away.score ? 1 : 0;
        record[1] += game.home.score > game.away.score ? 1 : 0;
      }
    });
  }
  return record;
};

const commonGames = function calculateCommonGamesRecord(teamA, teamB) {
  const oppsA = [];
  const oppsB = [];
  games.seasons.forEach((season) => {
    if (season.seasonNo === 2) {
      // Iterate across all s2 games
      season.weeks.forEach((week) => {
        week.games.forEach((game) => {
          // Check whether the game involves a team
          if (game.home.name === teamA) {
            oppsA.push(game.away.name);
          } else if (game.away.name === teamA) {
            oppsA.push(game.home.name);
          }
          if (game.home.name === teamB) {
            oppsB.push(game.away.name);
          } else if (game.away.name === teamB) {
            oppsB.push(game.home.name);
          }
        });
      });
    }
  });
  const commonOpps = oppsA.filter(opp => oppsB.includes(opp));
  if (commonOpps.length) {
    const recordA = [0, 0];
    const recordB = [0, 0];
    for (let i = 0; i < commonOpps.length; i += 1) {
      const opp = commonOpps[i];
      const oppRecordA = headToHead(teamA, opp);
      recordA[0] += oppRecordA[0];
      recordA[1] += oppRecordA[1];
      const oppRecordB = headToHead(teamB, opp);
      recordB[0] += oppRecordB[0];
      recordB[1] += oppRecordB[1];
    }
    return [recordA[0] - recordA[1], recordB[0] - recordB[1]];
  }
  return [0, 0];
};

const calcTeamStats = function calculateTeamStats(teamName, confName, divName) {
  const stats = {
    games: 0,
    wins: 0,
    losses: 0,
    ties: 0,
    div_wins: 0,
    div_losses: 0,
    div_ties: 0,
    conf_wins: 0,
    conf_losses: 0,
    conf_ties: 0,
    gameTime: 0,
    pf: 0,
    pa: 0,
    div_pf: 0,
    div_pa: 0,
    conf_pf: 0,
    conf_pa: 0,
    passYds: 0,
    opp_passYds: 0,
    rushYds: 0,
    opp_rushYds: 0,
    ints: 0,
    opp_ints: 0,
    fumbles: 0,
    opp_fumbles: 0,
    fgm: 0,
    opp_fgm: 0,
    fga: 0,
    opp_fga: 0,
    poss: 0,
    opp_poss: 0,
    streak_type: 0, // -1 L, 0 T, 1 W
    streak: 0,
  };
  games.seasons.forEach((season) => {
    if (season.seasonNo === 2) {
      // Iterate across all s2 games
      season.weeks.forEach((week) => {
        week.games.forEach((game) => {
          // Check whether the game involves this team
          if (game.away.name === teamName || game.home.name === teamName) {
            let team = null;
            let opp = null;

            if (game.home.name === teamName) {
              team = game.home;
              opp = game.away;
            } else {
              team = game.away;
              opp = game.home;
            }

            // add stats
            stats.games += 1;
            stats.gameTime += game.gameLength;
            stats.pf += team.score;
            stats.pa += opp.score;
            stats.passYds += team.passYds;
            stats.opp_passYds += opp.passYds;
            stats.rushYds += team.rushYds;
            stats.opp_rushYds += opp.rushYds;
            stats.ints += team.ints;
            stats.opp_ints += opp.ints;
            stats.fumbles += team.fumbles;
            stats.opp_fumbles += opp.fumbles;
            stats.fgm += team.fgm;
            stats.opp_fgm += opp.fgm;
            stats.fga += team.fga;
            stats.opp_fga += opp.fga;
            stats.poss += team.poss;
            stats.opp_poss += opp.poss;

            const oppTeamConf = getTeamDivConf(opp.name);

            if (team.score > opp.score) {
              stats.wins += 1;
              if (stats.streak_type === 1) {
                stats.streak += 1;
              } else {
                stats.streak_type = 1;
                stats.streak = 1;
              }
              if (!oocWeeks.includes(game.week) && game.week < 13) {
                stats.conf_wins += 1;
                stats.conf_pf += team.score;
                stats.conf_pa += opp.score;
              }
              if (oppTeamConf.conf === confName && oppTeamConf.div === divName) {
                stats.div_wins += 1;
                stats.div_pf += team.score;
                stats.div_pa += opp.score;
              }
            } else if (team.score < opp.score) {
              stats.losses += 1;
              if (stats.streak_type === -1) {
                stats.streak += 1;
              } else {
                stats.streak_type = -1;
                stats.streak = 1;
              }
              if (!oocWeeks.includes(game.week) && game.week < 13) {
                stats.conf_losses += 1;
                stats.conf_pf += team.score;
                stats.conf_pa += opp.score;
              }
              if (oppTeamConf.conf === confName && oppTeamConf.div === divName) {
                stats.div_losses += 1;
                stats.div_pf += team.score;
                stats.div_pa += opp.score;
              }
            } else {
              stats.ties += 1;
              if (stats.streak_type === 0) {
                stats.streak += 1;
              } else {
                stats.streak_type = 0;
                stats.streak = 1;
              }
              if (!oocWeeks.includes(game.week) && game.week < 13) {
                stats.conf_ties += 1;
                stats.conf_pf += team.score;
                stats.conf_pa += opp.score;
              }
              if (oppTeamConf.conf === confName && oppTeamConf.div === divName) {
                stats.div_ties += 1;
                stats.div_pf += team.score;
                stats.div_pa += opp.score;
              }
            }
          }
        });
      });
    }
  });

  return stats;
};

/*
  1. Conference wins
  2. Conference games over .500
  3. Head 2 Head
  4. Division wins
  5. Division games over .500
  6. Record in common games
  7. Conference point differential
  8. Division point differential
*/
const sortConf = function sortConferenceTeamsByStandings(conf) {
  for (let i = 0; i < conf.divs.length; i += 1) {
    conf.divs[i].teams.sort((a, b) => {
      if (a.stats.conf_wins > b.stats.conf_wins) {
        return -1;
      }
      if (a.stats.conf_wins < b.stats.conf_wins) {
        return 1;
      }
      if ((a.stats.conf_wins - a.stats.conf_losses) > (b.stats.conf_wins - b.stats.conf_losses)) {
        return -1;
      }
      if ((a.stats.conf_wins - a.stats.conf_losses) < (b.stats.conf_wins - b.stats.conf_losses)) {
        return 1;
      }
      // Head to head
      const h2hRecord = headToHead(a.name, b.name);
      if (h2hRecord[0] > h2hRecord[1]) {
        // console.log(`Used H2H for ${a.name} vs ${b.name}, ${a.name} wins ${h2hRecord[0]} - ${h2hRecord[1]}`);
        return -1;
      }
      if (h2hRecord[0] < h2hRecord[1]) {
        // console.log(`Used H2H for ${a.name} vs ${b.name}, ${b.name} wins ${h2hRecord[1]} - ${h2hRecord[0]}`);
        return 1;
      }
      // Division wins
      if (a.stats.div_wins > b.stats.div_wins) {
        // console.log(`Used div wins for ${a.name} vs ${b.name}, ${a.name} wins ${a.stats.div_wins} - ${b.stats.div_wins}.`);
        return -1;
      }
      if (a.stats.div_wins < b.stats.div_wins) {
        // console.log(`Used div record for ${a.name} vs ${b.name}, ${b.name} wins ${b.stats.div_wins} - ${a.stats.div_wins}.`);
        return 1;
      }
      if ((a.stats.div_wins - a.stats.div_losses) > (b.stats.div_wins - b.stats.div_losses)) {
        // console.log(`Used div wins for ${a.name} vs ${b.name}, ${a.name} wins ${a.stats.div_wins - a.stats.div_losses} - ${b.stats.div_wins - b.stats.div_losses}.`);
        return -1;
      }
      if ((a.stats.div_wins - a.stats.div_losses) < (b.stats.div_wins - b.stats.div_losses)) {
        // console.log(`Used div record for ${a.name} vs ${b.name}, ${b.name} wins ${b.stats.div_wins - b.stats.div_losses} - ${a.stats.div_wins - a.stats.div_losses}.`);
        return 1;
      }
      // Common games
      const commonRecord = commonGames(a.name, b.name);
      if (commonRecord[0] > commonRecord[1]) {
        // console.log(`Used common games for ${a.name} vs ${b.name}, ${a.name} wins ${commonRecord[0]} - ${commonRecord[1]}`);
        return -1;
      }
      if (commonRecord[0] < commonRecord[1]) {
        // console.log(`Used common games for ${a.name} vs ${b.name}, ${b.name} wins ${commonRecord[1]} - ${commonRecord[0]}`);
        return 1;
      }
      // Conference point diff
      if (((a.stats.conf_pf - a.stats.conf_pa) / a.stats.games) > ((b.stats.conf_pf - b.stats.conf_pa) / b.stats.games)) {
        // console.log(`Used conf point diff for ${a.name} vs ${b.name}, ${a.name} wins ${(a.stats.conf_pf - a.stats.conf_pa) / a.stats.games} - ${(b.stats.conf_pf - b.stats.conf_pa) / b.stats.games}.`);
        return -1;
      }
      if (((a.stats.conf_pf - a.stats.conf_pa) / a.stats.games) < ((b.stats.conf_pf - b.stats.conf_pa) / b.stats.games)) {
        // console.log(`Used conf point diff for ${a.name} vs ${b.name}, ${b.name} wins ${(b.stats.conf_pf - b.stats.conf_pa) / b.stats.games} - ${(a.stats.conf_pf - a.stats.conf_pa) / a.stats.games}.`);
        return 1;
      }
      // Division point diff
      if (((a.stats.div_pf - a.stats.div_pa) / a.stats.games) > ((b.stats.div_pf - b.stats.div_pa) / b.stats.games)) {
        // console.log(`Used div point diff for ${a.name} vs ${b.name}, ${a.name} wins ${(a.stats.div_pf - a.stats.div_pa) / a.stats.games} - ${(b.stats.div_pf - b.stats.div_pa) / b.stats.games}.`);
        return -1;
      }
      if (((a.stats.div_pf - a.stats.div_pa) / a.stats.games) < ((b.stats.div_pf - b.stats.div_pa) / b.stats.games)) {
        // console.log(`Used div point diff for ${a.name} vs ${b.name}, ${b.name} wins ${(b.stats.div_pf - b.stats.div_pa) / b.stats.games} - ${(a.stats.div_pf - a.stats.div_pa) / a.stats.games}.`);
        return 1;
      }
      console.log(`Could not determine ${a.name} vs ${b.name} - ${a.stats.conf_wins - a.stats.conf_losses} - ${b.stats.conf_wins - b.stats.conf_losses}, ${h2hRecord[0]} - ${h2hRecord[1]}, ${a.stats.div_wins - a.stats.div_losses} - ${b.stats.div_wins - b.stats.div_losses}, ${commonRecord[0]} - ${commonRecord[1]}, ${(a.stats.div_pf - a.stats.div_pa) / a.stats.games} - ${(b.stats.div_pf - b.stats.div_pa) / b.stats.games}, ${(a.stats.conf_pf - a.stats.conf_pa) / a.stats.games} - ${(b.stats.conf_pf - b.stats.conf_pa) / b.stats.games}`);
      return 0;
    });
  }
};

for (let i = 0; i < teams.confs.length; i += 1) {
  const conf = teams.confs[i];
  const confJson = {
    name: conf.name,
    divs: [],
  };
  for (let j = 0; j < conf.divs.length; j += 1) {
    const div = conf.divs[j];
    const divJson = {
      name: div.name,
      teams: [],
    };
    for (let k = 0; k < div.teams.length; k += 1) {
      const team = div.teams[k];
      const stats = calcTeamStats(team, conf.name, div.name);
      divJson.teams.push({
        name: team,
        stats,
      });
    }
    confJson.divs.push(divJson);
    sortConf(confJson);
  }
  confs.push(confJson);
}

writeJson({ confs }, 'stats.json');
