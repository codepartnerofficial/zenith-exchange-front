const { Service } = require('egg');
const { getSetData } = require('BlockChain-ui/node/utils');

class getFooterList extends Service {
  async getdata(domainData, host, currenLan) {
    getSetData(domainData, host, this, this.config.footerList, '/cms/footer/list', currenLan);
  }
}

module.exports = getFooterList;
