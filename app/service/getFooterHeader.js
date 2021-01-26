const { Service } = require('egg');
const { getSetData } = require('BlockChain-ui/node/utils');

class getFooterHeader extends Service {
  async getdataSync(domainData, host, currenLan, options) {
    return await getSetData(domainData, host, this, this.config.footerHeaderPath, 'common/footer_and_header', currenLan, options);
  }
  getdata(domainData, host, currenLan, options) {
    getSetData(domainData, host, this, this.config.footerHeaderPath, 'common/footer_and_header', currenLan, options);
  }
}

module.exports = getFooterHeader;
