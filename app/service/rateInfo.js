const { Service } = require('egg');
const { getSetData } = require('BlockChain-ui/node/utils');

class GetRateInfo extends Service {
  async getdataSync(domainData, host, currenLan, options) {
    return await getSetData(domainData, host, this, this.config.staticPath, 'common/rate', currenLan, options);
  }
  getdata(domainData, host, currenLan, options) {
    getSetData(domainData, host, this, this.config.staticPath, 'common/rate', currenLan, options);
  }
}
module.exports = GetRateInfo;
