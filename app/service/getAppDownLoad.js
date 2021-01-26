const { Service } = require('egg');
const { getSetData } = require('BlockChain-ui/node/utils');

class getAppDownLoad extends Service {
  async getdataSync(domainData, host, currenLan, options) {
    return await getSetData(domainData, host, this, this.config.appDownLoadPath, 'common/app_download', currenLan, options);
  }
  getdata(domainData, host, currenLan, options) {
    getSetData(domainData, host, this, this.config.appDownLoadPath, 'common/app_download', currenLan, options);
  }
}

module.exports = getAppDownLoad;
