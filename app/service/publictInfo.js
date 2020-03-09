const { Service } = require('egg');
const { getSetData } = require('BlockChain-ui/node/utils');

class GetpublicInfo extends Service {
  async getdata(domainData, host) {
    getSetData(domainData, host, this, this.config.staticPath, 'common/public_info_v4');
  }
}
module.exports = GetpublicInfo;
