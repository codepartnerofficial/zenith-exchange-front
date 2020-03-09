const { Service } = require('egg');
const { getSetData } = require('BlockChain-ui/node/utils');

class getAppDownLoad extends Service {
  async getdata(domainData, host) {
    getSetData(domainData, host, this, this.config.appDownLoadPath, 'common/app_download');
  }
}

module.exports = getAppDownLoad;
