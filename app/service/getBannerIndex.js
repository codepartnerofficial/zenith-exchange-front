const { Service } = require('egg');
const { getSetData } = require('BlockChain-ui/node/utils');

class getBannerIndex extends Service {
  async getdataSync(domainData, host, currenLan) {
    return await getSetData(domainData, host, this, this.config.bannerIndexPath, 'common/index', currenLan);
  }
  getdata(domainData, host, currenLan) {
    getSetData(domainData, host, this, this.config.bannerIndexPath, 'common/index', currenLan);
  }
}

module.exports = getBannerIndex;
