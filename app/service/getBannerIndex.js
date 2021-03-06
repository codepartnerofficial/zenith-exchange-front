const { Service } = require('egg');
const { getSetData } = require('BlockChain-ui/node/utils');

class getBannerIndex extends Service {
  async getdataSync(domainData, host, currenLan, options) {
    return await getSetData(domainData, host, this, this.config.bannerIndexPath, 'common/index', currenLan, options);
  }
  getdata(domainData, host, currenLan, options) {
    getSetData(domainData, host, this, this.config.bannerIndexPath, 'common/index', currenLan, options);
  }
}

module.exports = getBannerIndex;
