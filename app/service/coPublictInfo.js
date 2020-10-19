const { Service } = require('egg');
const { getSetData } = require('BlockChain-ui/node/utils');

class coGetpublicInfo extends Service {
  async getdataSync(domainData, host, currenLan) {
    return await getSetData(domainData, host, this, this.config.staticPath, 'common/co_home_market', currenLan);
  }
  getdata(domainData, host, currenLan) {
    getSetData(domainData, host, this, this.config.staticPath, 'common/co_home_market', currenLan);
  }
}

module.exports = coGetpublicInfo;
