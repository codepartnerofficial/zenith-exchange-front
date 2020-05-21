const { saveDataConfig, saveData } = require('BlockChain-ui/node/schedule/saveData');
module.exports = {
  schedule: saveDataConfig,
  async task(ctx) {
    saveData(ctx);
  },
};

