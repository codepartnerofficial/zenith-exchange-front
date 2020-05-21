const { Service } = require('egg');
const { getSetData } = require('BlockChain-ui/node/utils');

class getAppDownLoad extends Service {
  async getdataSync(domainData, host, currenLan) {
    await getSetData(domainData, host, this, this.config.appDownLoadKey, 'common/app_download', currenLan);
  }
  getdata(domainData, host, currenLan) {
    getSetData(domainData, host, this, this.config.appDownLoadKey, 'common/app_download', currenLan);
  }
}

module.exports = getAppDownLoad;
