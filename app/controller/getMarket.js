const { Controller } = require('egg');
const { getLocale, getFileName, getPublicInfo,  compare } = require('BlockChain-ui/node/utils');

class getMarket extends Controller {
  async index(ctx){
    const currenLan = ctx.params.id
    const cusSkin = ctx.cookies.get('cusSkin', {
      signed: false,
    });
    let nowHost = ctx.request.header.host;
    if (ctx.app.config.env === 'local') {
      nowHost = ctx.app.config.devUrlProxy.ex;
    }
   const publicInfo = getPublicInfo(ctx.app, currenLan, cusSkin, nowHost);
   ctx.body = { market: publicInfo.market, symbolAll: publicInfo.symbolAll};
  }
}

module.exports = getMarket;
