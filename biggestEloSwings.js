const elo = require('./output/elo.json');

const biggestSwings = [];

const pushGame = function pushGameToArray(position, team, seasonNo, game) {
  let swing = 0;

  if (Object.prototype.hasOwnProperty.call(game, 'eloChange')) {
    swing = game.eloChange;
  } else {
    swing = game['±'];
  }

  const gameInfo = {
    seasonNo,
    weekNo: game.weekNo,
    swing: Math.abs(swing),
  };

  if (!game.gameInfo) {
    return;
  }

  if (game.gameInfo.result === 'loss') {
    gameInfo.winningTeam = game.gameInfo.oppName;
    gameInfo.winningScore = game.gameInfo.oppScore;
    gameInfo.losingTeam = team;
    gameInfo.losingScore = game.gameInfo.score;
  } else {
    gameInfo.winningTeam = team;
    gameInfo.winningScore = game.gameInfo.score;
    gameInfo.losingTeam = game.gameInfo.oppName;
    gameInfo.losingScore = game.gameInfo.oppScore;
  }

  if (biggestSwings[position] && biggestSwings[position].winningTeam === 'North Dakota') {
    console.log(biggestSwings[position]);
    console.log(gameInfo);
  }

  biggestSwings[position] = gameInfo;

  biggestSwings.sort((a, b) => b.swing - a.swing);
};

const getPushPos = function getPushPosition(team, seasonNo, game) {
  // If not at 5 yet, return the first empty position
  if (biggestSwings.length < 10) {
    return biggestSwings.length;
  }

  let pushPos = -1;

  for (let i = 0; i < biggestSwings.length; i += 1) {
    const swing = biggestSwings[i];

    // Check if duplicate game; if so, return -1
    if (
      game.gameInfo
      && (
        (swing.winningTeam === game.gameInfo.oppName && swing.losingTeam === team)
        || (swing.winningTeam === team && swing.losingTeam === game.gameInfo.oppName)
      )
      && (swing.seasonNo === seasonNo && swing.weekNo === game.weekNo)
    ) {
      return -1;
    }

    let swingAmt = 0;
  
    if (Object.prototype.hasOwnProperty.call(game, 'eloChange')) {
      swingAmt = game.eloChange;
    } else {
      swingAmt = game['±'];
    }
    
    // Check if game should be in the list
    if (game.gameInfo && swing.swing < Math.abs(swingAmt)) {
      pushPos = i;
    }
  }

  return pushPos;
};

for (let i = 0; i < elo.teams.length; i += 1) {
  const team = elo.teams[i];
  for (let j = 0; j < team.seasons.length; j += 1) {
    const season = team.seasons[j];
    for (let k = 0; k < season.weeks.length; k += 1) {
      const game = season.weeks[k];
      
      const pushPos = getPushPos(team.name, season.seasonNo, game);

      if (pushPos >= 0) {
        pushGame(pushPos, team.name, season.seasonNo, game);
      }
    }
  }
}

for (let i = 0; i < biggestSwings.length; i += 1) {
  const swing = biggestSwings[i];
  console.log(`S${swing.seasonNo}W${swing.weekNo}: ${swing.winningTeam} gains ${Math.round(swing.swing * 10) / 10} Elo points with their ${swing.winningScore}-${swing.losingScore} victory over ${swing.losingTeam}`);
}
