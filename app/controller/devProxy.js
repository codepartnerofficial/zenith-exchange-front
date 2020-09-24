const { Controller } = require('egg');

class devProxy extends Controller {
  async index(ctx) {
    const {url, method, header} = ctx.request;
    const host = this.config.devUrlProxy.ex;
    const ip = this.config.LOCAL_IP;
    header['X-Forwarded-For'] = ip;
    delete header['origin'];
    delete header['host'];
    delete header['referer'];
    let obj = {
      method,
      headers: header,
      dataType: 'json',
    }
    if(obj.method.toUpperCase() === 'POST'){
      obj.data = JSON.stringify(ctx.request.body)
    }
    const data = await ctx.curl(`${host}${url}`, obj);
      ctx.body = data.res.data;
  }
}

module.exports = devProxy;
