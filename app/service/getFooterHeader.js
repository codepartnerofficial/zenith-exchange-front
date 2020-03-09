const { Service } = require('egg');
const { getSetData } = require('BlockChain-ui/node/utils');

class getFooterHeader extends Service {
  async getdata(domainData, host) {
    getSetData(domainData, host, this, this.config.footerHeaderPath, 'common/footer_and_header');
  }
}

module.exports = getFooterHeader;
