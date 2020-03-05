const { Controller } = require('egg');
const fs = require('fs');
const path = require('path');
const { getLocale, getFileName, getPublicInfo } = require('../utils/index');

class StaticIndex extends Controller {
  async get(ctx) {
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
    this.publicInfo = getPublicInfo(this);
    this.locale = getLocale(currenLan, fileName, fileBasePath, this.logger);
    const { msg, lan } = this.publicInfo;
    const { header } = this.getLocalData(fileName, this.config.footerHeaderPath);
    const customHeaderList = JSON.parse(header);
    this.headerLink = this.getHeaderLink();
    if (!domainArr[fileName]) {
      domainArr[fileName] = {
        fileName,
        domainName: `${ctx.app.httpclient.agent.protocol}//${nowHost}`,
      };
    }
    ctx.service.getFooterHeader.getdata(domainArr[fileName], ctx.request.header.host);
    ctx.service.getAppDownLoad.getdata(domainArr[fileName], ctx.request.header.host);
    await ctx.render('./index.njk', {
      locale: this.locale,
      msg,
      headerLink: this.headerLink,
      headerList: this.getHeaderList(),
      customHeaderList,
      appDownLoad: this.getLocalData(fileName, this.config.appDownLoadPath),
      lanList: lan.lanList,
    });
  }

  getLocalData(fileName, fileBasePath) {
    let obj = {};
    console.log(fileBasePath, fileName);
    try {
      obj = JSON.parse(fs.readFileSync(path.join(fileBasePath, `${fileName}.json`), 'utf-8'));
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
    const { header, etfAdd, mobilityTrade } = this.locale;
    // 行情
    if (this.publicInfo.switch.index_kline_switch === '1') {
      arr.push({
        title: header.market,
        activeId: 'market',
        link: this.headerLink.market,
      });
    }

    // 币币交易
    if (this.headerLink.trade) {
      arr.push({
        title: header.trade,
        activeId: 'exTrade',
        link: this.headerLink.trade,
      });
    }
    // 法币
    if (this.headerLink.otc) {
      arr.push({
        title: header.otc,
        activeId: 'otcTrade',
        link: this.headerLink.otc,
      });
    }
    // 一键买币
    if (!this.headerLink.otc && this.saasOtcFlowConfig) {
      arr.push({
        title: mobilityTrade.immediately,
        activeId: 'otcTrade',
        link: '/mobility',
      });
    }
    // 合约
    if (this.headerLink.co) {
      arr.push({
        title: header.co,
        activeId: 'coTrade',
        link: this.headerLink.co,
      });
    }
    // 杠杆
    if (this.leverFlag) {
      arr.push({
        title: header.lever,
        activeId: 'marginTrade',
        link: this.headerLink.lever,
      });
    }
    // etf
    // 币币交易
    if (this.etfOpen) {
      arr.push({
        title: etfAdd.title,
        activeId: 'etf',
        link: this.etfUrl,
      });
    }
    return arr;
  }
}

module.exports = StaticIndex;
