const { Service } = require('egg');
const { getSetData } = require('BlockChain-ui/node/utils');

class GetMarketInfo extends Service {
  async getdataSync(domainData, host, currenLan, options) {
    return await getSetData(domainData, host, this, this.config.staticPath, 'common/public_info_market', currenLan, options);
  }
  getdata(domainData, host, currenLan, options) {
    getSetData(domainData, host, this, this.config.staticPath, 'common/public_info_market', currenLan, options);
  }
}
module.exports = GetMarketInfo;
