const fsp = require('fs').promises;

module.exports = function writeJson(json, fileName) {
  return new Promise((resolve, reject) => {
    const prefixedFileName = `./output/${fileName}`;
    fsp.writeFile(prefixedFileName, JSON.stringify(json, null, 2))
      .then(() => {
        resolve(`${prefixedFileName} has successfully been written.`);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
