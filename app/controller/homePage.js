const { Controller } = require('egg');
const fs = require('fs');
const path = require('path');
const { getLocale, getFileName, getPublicInfo } = require('BlockChain-ui/node/utils');

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
    this.publicInfo = getPublicInfo(this);
    this.setLan(fileName);
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

  async setLan(domain) {
    // 取得client一级路由 clientUrlLan
    const clientUrlLan = this.ctx.request.path.split('/')[1];
    // 取得client cookie中语言 clientCookLan
    const clientCookLan = this.ctx.cookies.get('lan');
    const cookieDomain = domain === 'hiex.pro' ? 'bitwind.com' : domain;
    const dLan = 'en_US';
    const reg = /^[a-z]{2}_[A-Z]{2}$/;
    //console.log(this.publicInfo);
    if (this.publicInfo.lan) {
      // 针对 publicInfo => lan => defLan 兼容处理
      let serverDefLan = dLan;
      if (this.publicInfo.lan.defLan) {
        serverDefLan = this.publicInfo.lan.defLan;
      } else {
        const errorData = {
          domain,
          message: `未拿到publicInfo.lan.defLan对象, 语言强制转为${serverDefLan}`,
          key: 'publicInfo.lan.defLan',
          data: this.publicInfo.lan.defLan,
        };
        if (!hostFilter.test(domain)) {
          this.logger.error(JSON.stringify(errorData));
        }
      }

      // 针对 publicInfo => lan => lanList 兼容处理
      let severLanList = [];
      console.log(this.publicInfo.lan)
      if (this.publicInfo.lan.lanList instanceof Array) {
        severLanList = this.publicInfo.lan.lanList;
      } else {
        const errorData = {
          domain,
          message: '未拿到publicInfo.lan.lanList对象, 转为[]',
          key: 'publicInfo.lan.lanList',
          data: this.publicInfo.lan.lanList,
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
