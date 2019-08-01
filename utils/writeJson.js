const fs = require('fs');

module.exports = function writeJson(json, fileName) {
  return new Promise((resolve, reject) => {
    const prefixedFileName = `./output/${fileName}`;
    fs.writeFile(prefixedFileName, JSON.stringify(json, null, 2), (err) => {
      if (err) {
        reject(err);
      }
      resolve(`${prefixedFileName} has successfully been written.`);
    });
  });
};
