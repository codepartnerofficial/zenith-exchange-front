const { Service } = require('egg');
const { getSetData } = require('BlockChain-ui/node/utils');

class getFooterList extends Service {
  async getdataSync(domainData, host, currenLan, options) {
    return await getSetData(domainData, host, this, this.config.footerList, '/cms/footer/list', currenLan, options);
  }
  getdata(domainData, host, currenLan, options) {
    getSetData(domainData, host, this, this.config.footerList, '/cms/footer/list', currenLan, options);
  }
}

module.exports = getFooterList;
