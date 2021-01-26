const { Service } = require('egg');
const { getSetData } = require('BlockChain-ui/node/utils');

class GetpublicInfo extends Service {
  async getdataSync(domainData, host, currenLan, options) {
    return await getSetData(domainData, host, this, this.config.staticPath, 'common/public_info_v4', currenLan, options);
  }
  getdata(domainData, host, currenLan, options) {
    getSetData(domainData, host, this, this.config.staticPath, 'common/public_info_v4', currenLan, options);
  }
}
module.exports = GetpublicInfo;
