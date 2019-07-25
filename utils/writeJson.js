const fs = require('fs');

module.exports = function writeJson(json, fileName) {
  fs.writeFile(fileName, JSON.stringify(json, null, 2), (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`${fileName} has successfully been written.`);
    }
  });
};
