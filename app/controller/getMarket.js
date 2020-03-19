const { Controller } = require('egg');
const { getLocale, getFileName, getPublicInfo,  compare } = require('BlockChain-ui/node/utils');

class getMarket extends Controller {
  async index(ctx){
    const currenLan = this.ctx.cookies.get('lan', {
      signed: false,
    });
   const publicInfo = getPublicInfo(this, currenLan);
   ctx.body = { market: publicInfo.market, symbolAll: publicInfo.symbolAll};
  }
}

module.exports = getMarket;
