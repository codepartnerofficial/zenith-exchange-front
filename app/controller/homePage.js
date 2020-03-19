const { Controller } = require('egg');
const fs = require('fs');
const path = require('path');
const { getLocale, getFileName, getPublicInfo,  compare } = require('BlockChain-ui/node/utils');
const webWorkerMap = JSON.stringify(require('../view/src/assets/js/webworker-map'));

class StaticIndex extends Controller {
  async index(ctx) {
    const currenLan = this.ctx.cookies.get('lan', {
      signed: false,
    });
    const { domainArr } = this.config;
    const fileName = getFileName(this);
    const fileBasePath = this.config.localesPath;
    let nowHost = this.ctx.request.header.host;
    if (this.config.env === 'local') {
      nowHost = this.config.devUrlProxy.ex;
    }
    if (!domainArr[fileName]) {
      domainArr[fileName] = {
        fileName,
        domainName: `${ctx.app.httpclient.agent.protocol}//${nowHost}`,
      };
    }
    this.publicInfo = getPublicInfo(this, currenLan);
    this.setLan(fileName);
    //ctx.service.publictInfo.getdata(domainArr[fileName], ctx.request.header.host, currenLan);
    //ctx.service.getFooterHeader.getdata(domainArr[fileName], ctx.request.header.host, currenLan);
    //ctx.service.getAppDownLoad.getdata(domainArr[fileName], ctx.request.header.host, currenLan);
    //ctx.service.getBannerIndex.getdata(domainArr[fileName], ctx.request.header.host, currenLan);
    const { noticeInfoList, cmsAdvertList } = this.getLocalData(fileName, this.config.bannerIndexPath, currenLan);
    this.locale = getLocale(currenLan, fileName, fileBasePath, this.logger);
    const { msg, lan, skin, market, symbolAll } = this.publicInfo;
    const headerFooter = this.getLocalData(fileName, this.config.footerHeaderPath, currenLan);
    let customHeaderList = {};
    if(headerFooter && headerFooter.header){
      customHeaderList = JSON.parse(headerFooter.header);
    }
    this.headerLink = this.getHeaderLink();
    await ctx.render('./index.njk', {
      locale: this.locale,
      msg,
      headerLink: this.headerLink,
      headerList: this.getHeaderList().slice(0, 2),
      customHeaderList,
      headerSymbol: market.headerSymbol,
      appDownLoad: this.getLocalData(fileName, this.config.appDownLoadPath, currenLan),
      lanList: lan.lanList,
      switch: this.publicInfo.switch,
      assetsList: this.assetsList(),
      orderList: this.orderList(),
      number: (item) => Number(item),
      colorList: this.getColorList(),
      noticeList: this.getNoticeList(noticeInfoList).slice(0, 4),
      cmsAdvertList: cmsAdvertList.slice(0, 4),
      symbolAll,
      webWorkerMap,
    });
  }

  getNoticeList(noticeInfoList) {
    const { index_international_open } = this.publicInfo.switch;
    if (noticeInfoList && noticeInfoList.length) {
      const arr = [];
      let length = 18;
      if (index_international_open === 1) {
        length = 50;
      }
      noticeInfoList.forEach((item) => {
        const space = item.title.length > length ? '...' : '';
        arr.push({
          noticeText: `${item.title.substr(0, length)}${space}`,
          id: item.id,
        });
      });
      return arr;
    }
  }

  getColorList(){
    const { skin } = this.publicInfo;
    if (!skin){
      return [];
    }
    let sk = skin.default;
    const cusSkin = this.ctx.cookies.get('cusSkin', {
      signed: false,
    });
    if(cusSkin && cusSkin !== 'undefined'){
      sk = cusSkin;
    }
    const list = [];
    const lis = skin.listist;
    lis.forEach((item) => {
      const obj = {
        mainClor: item.mainClor,
        skinId: item.skinId,
      };
      if(item.skinId === sk){
        obj['checked'] = "checked";
      }
      list.push(obj);
    });
    return list;
  }

  __getLocale(val){
    const arr = val.split('.');
    let locale = this.locale;
    let geted = true;
    arr.forEach((item) => {
      if(locale[item]){
        locale = locale[item];
      }else{
        geted = false;
      }
    });
    return geted ? locale : val;
  }

  orderList() {
    const arr = [];
    const pubSwitch = this.publicInfo.switch;
    const { headerLink } = this;
    if (headerLink.trade) {
      arr.push({
        title: this.__getLocale('order.index.exOrder'),
        link: '/order/exchangeOrder',
      });
    }
    const otcTitle = !pubSwitch.fiat_trade_open
      ? this.__getLocale('order.index.otcOrder')
      : this.__getLocale('assets.b2c.otcShow.otcOrder');

    if (headerLink.otc) {
      arr.push({
        title: otcTitle,
        link: '/order/otcOrder',
      });
    }
    if (!headerLink.otc && Number(pubSwitch.saas_otc_flow_config)) {
      arr.push({
        title: otcTitle,
        link: '/order/otcOrder',
      });
    }
    if (headerLink.co) {
      let url = `${headerLink.co}/order/coOrder`;
      if (this.app.config.buildEnv === 'co') {
        url = '/order/coOrder';
      }
      arr.push({
        title: this.__getLocale('order.coOrder.coOrder'),
        link: url,
      });
    }
    if (Number(pubSwitch.lever_open)) {
      arr.push({
        title: this.__getLocale('order.index.leverage'),
        link: '/order/leverageOrder',
      });
    }
    return arr;
  }

  assetsList() {
    const arr = [];
    const { headerLink } = this;
    const pubSwitch = this.publicInfo.switch;
    if (headerLink.trade) {
      arr.push({
        title: this.__getLocale('assets.index.exchangeAccount'),
        link: '/assets/exchangeAccount',
      });
    }

    const otcTitle = !(pubSwitch.fiat_trade_open)
      ? this.__getLocale('assets.index.otcAccount')
      : this.__getLocale('assets.b2c.otcShow.otcAccount');

    if (headerLink.otc) {
      arr.push({
        title: otcTitle,
        link: '/assets/otcAccount',
      });
    }
    if (Number(pubSwitch.fiat_trade_open)) {
      arr.push({
        title: this.__getLocale('assets.index.otcAccount'),
        link: '/assets/b2cAccount',
      });
    }
    if (!headerLink.otc && Number(pubSwitch.saas_otc_flow_config)) {
      arr.push({
        title: otcTitle,
        link: '/assets/otcAccount',
      });
    }
    if (headerLink.co) {
      let url = `${headerLink.co}/assets/coAccount`;
      if (this.app.config.buildEnv === 'co') {
        url = '/assets/coAccount';
      }
      arr.push({
        title: this.__getLocale('assets.index.coAccount'),
        link: url,
      });
    }
    if (Number(pubSwitch.lever_open)) {
      arr.push({
        title: this.__getLocale('assets.index.leverage'),
        link: '/assets/leverageAccount',
      });
    }
    return arr;
  }

  getLocalData(fileName, fileBasePath, lan) {
    let obj = {};
    try {
      obj = JSON.parse(fs.readFileSync(path.join(fileBasePath, `${lan}-${fileName}.json`), 'utf-8'));
      // eslint-disable-next-line no-empty
    } catch (err) {

    }
    return obj.data;
  }

  getHeaderLink() {
    const { url } = this.publicInfo;
    return {
      home: url.exUrl,
      trade: url.exUrl ? `${url.exUrl}/trade` : '',
      market: url.exUrl ? `${url.exUrl}/market` : '',
      otc: url.otcUrl,
      lever: url.exUrl ? `${url.exUrl}/margin` : '',
      co: url.coUrl,
    };
  }

  getHeaderList() {
    const arr = [];
    const pubSwitch = this.publicInfo.switch;
    const { headerLink } = this;
    // 行情
    if (pubSwitch.index_kline_switch === '1') {
      arr.push({
        title: this.__getLocale('header.market'),
        activeId: 'market',
        link: headerLink.market,
      });
    }

    // 币币交易
    if (headerLink.trade) {
      arr.push({
        title: this.__getLocale('header.trade'),
        activeId: 'exTrade',
        link: headerLink.trade,
      });
    }
    // 法币
    if (headerLink.otc) {
      arr.push({
        title: Number(pubSwitch.fiatTradeOpen) ?
          this.__getLocale('assets.b2c.otcShow.header') : this.__getLocale('header.otc'),
        activeId: 'otcTrade',
        link: headerLink.otc,
      });
    }
    // 一键买币
    if (!headerLink.otc && Number(pubSwitch.saas_otc_flow_config)) {
      arr.push({
        title: this.__getLocale('mobilityTrade.immediately'),
        activeId: 'otcTrade',
        link: '/mobility',
      });
    }
    // 合约
    if (headerLink.co) {
      arr.push({
        title: this.__getLocale('header.co'),
        activeId: 'coTrade',
        link: headerLink.co,
      });
    }
    // 杠杆
    if (Number(pubSwitch.lever_open)) {
      arr.push({
        title: this.__getLocale('header.lever'),
        activeId: 'marginTrade',
        link: headerLink.lever,
      });
    }
    // etf
    // 币币交易
    if (Number(pubSwitch.etfOpen)) {
      arr.push({
        title: this.__getLocale('etfAdd.title'),
        activeId: 'etf',
        link: this.etfUrl(),
      });
    }

    return arr;
  }

  etfUrl(){
    let str = '';
    const { market } = this.publicInfo;
    if (market) {
      const etfArr = [];
      if (market.market.ETF){
        Object.keys(market.market.ETF).forEach((ci) => {
          etfArr.push(market.market.ETF[ci]);
        });
        const symbol = etfArr.sort(compare('sort'))[0];
        const name = symbol.showName || symbol.name;
        str = name.replace('/', '_');
      }
    }
    return `${this.headerLink.trade}/${str}`;
  }

  async setLan(domain) {
    const { lan } = this.publicInfo;
    // 取得client一级路由 clientUrlLan
    const clientUrlLan = this.ctx.request.path.split('/')[1];
    // 取得client cookie中语言 clientCookLan
    const clientCookLan = this.ctx.cookies.get('lan');
    const cookieDomain = domain === 'hiex.pro' ? 'bitwind.com' : domain;
    const dLan = 'en_US';
    const reg = /^[a-z]{2}_[A-Z]{2}$/;
    if (lan) {
      // 针对 publicInfo => lan => defLan 兼容处理
      let serverDefLan = dLan;
      if (lan.defLan) {
        serverDefLan = this.publicInfo.lan.defLan;
      } else {
        const errorData = {
          domain,
          message: `未拿到publicInfo.lan.defLan对象, 语言强制转为${serverDefLan}`,
          key: 'publicInfo.lan.defLan',
          data: lan.defLan,
        };
        if (!hostFilter.test(domain)) {
          this.logger.error(JSON.stringify(errorData));
        }
      }

      // 针对 publicInfo => lan => lanList 兼容处理
      let severLanList = [];
      if (lan.lanList instanceof Array) {
        severLanList = lan.lanList;
      } else {
        const errorData = {
          domain,
          message: '未拿到publicInfo.lan.lanList对象, 转为[]',
          key: 'publicInfo.lan.lanList',
          data: lan.lanList,
        };
        if (!hostFilter.test(domain)) {
          this.logger.error(JSON.stringify(errorData));
        }
      }

      // 处理数据 lans
      const lans = [];
      if (severLanList.length) {
        severLanList.forEach((item) => {
          lans.push(item.id);
        });
      } else {
        lans.push(serverDefLan);
      }
      // 如果url中的语言合法，则同步cookie
      if (lans.indexOf(clientUrlLan) !== -1) {
        this.ctx.cookies.set('lan', clientUrlLan, {
          httpOnly: false,
          domain: cookieDomain,
        });
      } else {
        const lan = lans.indexOf(clientCookLan) !== -1 ? clientCookLan : serverDefLan;
        let redirectUrl = '';
        if (reg.test(clientUrlLan)) {
          const vu = this.ctx.request.url.split(`/${clientUrlLan}`)[1];
          redirectUrl = vu;
        } else {
          redirectUrl = this.ctx.request.url;
        }
        this.ctx.redirect(`/${lan}${redirectUrl}`);
      }

      this.lan = clientUrlLan;
    } else {
      const errorData = {
        domain,
        message: `未拿到publicInfo.lan对象, 语言强制转为${dLan}`,
        key: 'publicInfo.lan',
        data: this.publicInfo.data.lan,
      };
      if (!hostFilter.test(domain)) {
        this.logger.error(JSON.stringify(errorData));
      }
      if (clientUrlLan === dLan) {
        this.ctx.cookies.set('lan', dLan, {
          httpOnly: false,
          domain: cookieDomain,
        });
      } else {
        let redirectUrl = '';
        if (reg.test(clientUrlLan)) {
          const vu = this.ctx.request.url.split(`/${clientUrlLan}`)[1];
          redirectUrl = vu;
        } else {
          redirectUrl = this.ctx.request.url;
        }
        this.ctx.redirect(`/${dLan}${redirectUrl}`);
      }
      this.lan = clientUrlLan;
    }
  }
}

module.exports = StaticIndex;
