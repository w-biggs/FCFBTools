const writeJson = require('./utils/writeJson');
const { getAllEQW } = require('./utils/calcEQW');

const results = getAllEQW(2);

results.sort((a, b) => b.eqw - a.eqw);

writeJson(results, 'eqw.json')
  .then((response) => {
    console.log(response);
  })
  .catch(error => console.error(error));
