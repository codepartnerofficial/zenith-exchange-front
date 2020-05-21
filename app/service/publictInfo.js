const { Service } = require('egg');
const { getSetData } = require('BlockChain-ui/node/utils');

class GetpublicInfo extends Service {
  async getdataSync(domainData, host, currenLan) {
    await getSetData(domainData, host, this, this.config.staticKey, 'common/public_info_v4', currenLan);
  }
  getdata(domainData, host, currenLan) {
    getSetData(domainData, host, this, this.config.staticKey, 'common/public_info_v4', currenLan);
  }
}
module.exports = GetpublicInfo;
