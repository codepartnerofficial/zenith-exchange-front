const { getDefaultSkin, getDefaultSkinConfig } = require('BlockChain-ui/node/schedule/getDefault-skin');

module.exports = {
  schedule: getDefaultSkinConfig,
  async task(ctx) {
    getDefaultSkin(this.schedule, ctx.logger, ctx);
  },
};
