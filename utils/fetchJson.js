const https = require('https');

module.exports = (toSearch, single) => new Promise((resolve, reject) => {
  let url = '';
  if (single) {
    url = `https://www.reddit.com/api/info.json?id=t3_${toSearch}`;
  } else {
    url = `https://www.reddit.com/r/FakeCollegeFootball/search.json?q=-flair:%22Post+Game+Thread%22%20title:%22${toSearch}%22&sort=new&restrict_sr=on&limit=100`;
  }

  const request = https.get(url, (response) => {
    // Handle http errors
    if (response.statusCode < 200 || response.statusCode > 299) {
      reject(new Error(`Failed to load page, status code: ${response.statusCode}`));
    }

    // Temporary data holder
    const body = [];

    // Push chunks to the body array
    response.on('data', chunk => body.push(chunk));

    response.on('end', () => resolve({
      json: JSON.parse(body.join('')),
      toSearch,
    }));
  });
  // Handle connection errors
  request.on('error', err => reject(err));
});
