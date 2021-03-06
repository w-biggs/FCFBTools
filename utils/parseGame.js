const fixEntities = function fixHtmlEntities(string) {
  return string.replace('&amp;', '&').replace('&amp;', '&').replace('&amp;', '&');
};

module.exports = function parseGame(rawJson) {
  /* Get selftext from post json */
  const { data } = rawJson.data.children[0];

  /* Complete games only */
  if (!data.selftext.includes('Game complete')) {
    return false;
  }

  /* json for the parsed game */
  const gameJson = {
    week: 18, // TODO: MAGIC NUMBER FIX!
    id: data.id,
    gameLength: 0,
    startTime_utc: data.created_utc,
    endTime_utc: data.edited,
    away: {},
    home: {},
    manuallyFixed: false,
  };

  const regex = /\*\*(.*?)\*\* @ .*?\*\*(.*?)\*\*[\s\S]*?:-:\n(.*?) yards\|(.*?) yards\|(.*?) yards\|(.*?)\|(.*?)\|(.*?)\/(.*?)\|(.*?)\|(.*?)\n[\s\S]*?:-:\n(.*?) yards\|(.*?) yards\|(.*?)yards\|(.*?)\|(.*?)\|(.*?)\/(.*?)\|(.*?)\|(.*?)\n[\s\S]*?:-:\n.*?\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|\*\*(.*?)\*\*\n.*?\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|\*\*(.*?)\*\*\n/gm;
  let match = regex.exec(data.selftext);

  if (match && match.length) {
    match = match.slice(1, 31);
    [gameJson.away.name,
      gameJson.home.name,
      gameJson.away.passYds,
      gameJson.away.rushYds,
      gameJson.away.yds,
      gameJson.away.ints,
      gameJson.away.fumbles,
      gameJson.away.fgm,
      gameJson.away.fga,
      gameJson.away.poss,
      gameJson.away.timeouts,
      gameJson.home.passYds,
      gameJson.home.rushYds,
      gameJson.home.yds,
      gameJson.home.ints,
      gameJson.home.fumbles,
      gameJson.home.fgm,
      gameJson.home.fga,
      gameJson.home.poss,
      gameJson.home.timeouts,
      gameJson.home.q1,
      gameJson.home.q2,
      gameJson.home.q3,
      gameJson.home.q4,
      gameJson.home.score,
      gameJson.away.q1,
      gameJson.away.q2,
      gameJson.away.q3,
      gameJson.away.q4,
      gameJson.away.score] = match;

    gameJson.home.name = fixEntities(gameJson.home.name);
    gameJson.away.name = fixEntities(gameJson.away.name);

    const awayPoss = gameJson.away.poss.split(':');
    gameJson.away.poss = (parseInt(awayPoss[0], 10) * 60) + parseInt(awayPoss[1], 10);
    const homePoss = gameJson.home.poss.split(':');
    gameJson.home.poss = (parseInt(homePoss[0], 10) * 60) + parseInt(homePoss[1], 10);
    gameJson.gameLength = Math.min(gameJson.away.poss + gameJson.home.poss, 1680);

    // Convert numbers. DRY.
    ['home', 'away'].forEach((teamString) => {
      const team = gameJson[teamString];
      Object.keys(team).forEach((key) => {
        if (key !== 'name') {
          team[key] = parseInt(team[key], 10);
        }
      });
    });
  } else {
    console.error(`No regex match for ${data.id}.`);
  }

  return gameJson;
};
