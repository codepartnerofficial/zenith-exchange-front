const { Controller } = require('egg');
const fs = require('fs');
const path = require('path');
const { getFileName, compare, mergeSkin } = require('BlockChain-ui/node/utils');
const { hostFilter } = require('BlockChain-ui/node/utils');
const templateConfig = require('../utils/template-config');
const stringRandom = require('string-random');
const { cloneDeep, merge } = require('lodash');

class StaticIndex extends Controller {
  async getCoPublicInfo(domainArr, fileName, currenLan, options) {
    const serviceArr = [];
    serviceArr.push(this.ctx.service.coPublictInfo.getdataSync(domainArr[fileName], this.ctx.request.header.host, currenLan, options));
    const results = await Promise.all(serviceArr);
    results.forEach(item => {
      if (item) {
        const k = Object.keys(item)[0];
        const res = item[k];
        switch (k) {
          case 'common/co_home_market': {
            this.coPublicInfo = res || {};
            break;
          }
        }
      }
    });
  }
  async getHeaderAndFooter(domainArr, fileName, currenLan, options) {
    const results = await Promise.all([
      this.ctx.service.getFooterHeader.getdataSync(domainArr[fileName], this.ctx.request.header.host, currenLan, options),
    ]);
    results.forEach(item => {
      if (item) {
        const k = Object.keys(item)[0];
        const res = item[k];
        switch (k) {
          case 'common/footer_and_header': {
            this.headerFooter = res;
            break;
          }
          default:
            break;
        }
      }
    });
  }
  async getHeaderAndFooterV2(domainArr, fileName, currenLan, options) {
    const results = await Promise.all([
      this.ctx.service.getFooterHeaderV2.getdataSync(domainArr[fileName], this.ctx.request.header.host, currenLan, options),
    ]);
    results.forEach(item => {
      if (item) {
        const k = Object.keys(item)[0];
        const res = item[k];
        switch (k) {
          case 'common/v2/footer_and_header': {
            if (res && res.header) {
              this.headerFooter = res;
            }
            break;
          }
          default:
            break;
        }
      }
    });
  }
  async index(ctx) {
    this.randomToken = stringRandom(36);
    this.logger.error(JSON.stringify({
      message: `????????????????????? ????????????---${this.ctx.request.header.host}???????????????---${this.ctx.request.url} ??????randomToken---${this.randomToken}`,
    }));
    let ispc = true;
    const tempList = [ '51', '52', '53', '54' ];
    const deviceAgent = this.ctx.request.header['user-agent'].toLowerCase();
    const reg = /^[a-z]{2}_[A-Z]{2}$/;
    const nowHost = this.ctx.request.header.host;
    const agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
    if (agentID) {
      const hostArr = nowHost.split('.');
      let toUrl = `${ctx.app.httpclient.agent.protocol}//m.${hostArr[1]}.${hostArr[2]}`;
      if (hostArr.length === 2) {
        toUrl = `${ctx.app.httpclient.agent.protocol}//m.${hostArr[0]}.${hostArr[1]}`;
      }
      ctx.redirect(toUrl);
      return;
      ispc = false;
    }
    let currenLan = this.ctx.request.path.split('/')[1];
    if (!currenLan) {
      currenLan = 'en_US';
    }
    const cusSkin = ctx.cookies.get('cusSkin', {
      signed: false,
    });
    const { domainArr } = this.config;
    const fileName = getFileName(this);
    if (!domainArr[fileName]) {
      domainArr[fileName] = {
        fileName,
        domainName: `${ctx.app.httpclient.agent.protocol}//${nowHost}`,
      };
    }
    // serviceArr.push(ctx.service.coPublictInfo.getdataSync(domainArr[fileName], ctx.request.header.host, currenLan))
    const results = await Promise.all([
      ctx.service.publictInfo.getdataSync(domainArr[fileName], ctx.request.header.host, currenLan, { randomToken: this.randomToken }),
      ctx.service.marketInfo.getdataSync(domainArr[fileName], ctx.request.header.host, currenLan, { randomToken: this.randomToken }),
      ctx.service.rateInfo.getdataSync(domainArr[fileName], ctx.request.header.host, currenLan, { randomToken: this.randomToken }),
      ctx.service.getAppDownLoad.getdataSync(domainArr[fileName], ctx.request.header.host, currenLan, { randomToken: this.randomToken }),
      ctx.service.getBannerIndex.getdataSync(domainArr[fileName], ctx.request.header.host, currenLan, { randomToken: this.randomToken }),
      ctx.service.getFooterList.getdataSync(domainArr[fileName], ctx.request.header.host, currenLan, { randomToken: this.randomToken }),
    ]);
    results.forEach(item => {
      if (item) {
        const k = Object.keys(item)[0];
        const res = item[k];
        switch (k) {
          case 'common/public_info_v5': {
            this.publicInfo = res;
            break;
          }
          case 'common/public_info_market': {
            this.marketInfo = res;
            break;
          }
          case 'common/rate': {
            this.rateInfo = res;
            break;
          }
          case 'common/app_download': {
            this.appDownLoad = res;
            break;
          }
          case 'common/index': {
            this.commonIndex = res;
            break;
          }
          case '/cms/footer/list': {
            this.footerList = res;
            break;
          }
          case 'common/co_home_market': {
            this.coPublicInfo = res || {};
            break;
          }
        }
      }
    });
    if (!this.publicInfo || !this.appDownLoad || !this.commonIndex || !this.footerList || !this.marketInfo || !this.rateInfo) {
      ctx.body = '????????????????????????????????????';
      return;
    }
    if (this.publicInfo.switch.index_temp_type.toString() === '9') {
      await this.getCoPublicInfo(domainArr, fileName, currenLan, { randomToken: this.randomToken });
    }
    if (tempList.indexOf(this.publicInfo.switch.index_temp_type) > -1) {
      await this.getHeaderAndFooterV2(domainArr, fileName, currenLan, { randomToken: this.randomToken });
    } else {
      await this.getHeaderAndFooter(domainArr, fileName, currenLan, { randomToken: this.randomToken });
    }
    const domain = nowHost.replace(new RegExp(`^${nowHost.split('.')[0]}.`), '');
    this.setLan(domain);
    if (!reg.test(currenLan)) {
      return;
    }
    if (this.publicInfo.skin) {
      mergeSkin(this.publicInfo.skin, this.config.defaultSkin);
    }
    const {
      noticeInfoList = [],
      cmsAdvertList = [],
      footer_warm_prompt = '',
      index_international_title1 = '',
      index_international_title2 = '',
      cmsAppAdvertList = [],
    } = this.commonIndex;
    let defaultLocale = {};
    try {
      if (this.config.defaultLocales[`${currenLan}.json`]) {
        defaultLocale = cloneDeep(this.config.defaultLocales[`${currenLan}.json`]);
      }
    } catch (e) {
      this.logger.error(JSON.stringify({
        message: '???????????????clone??????',
      }));
    }
    let locale = {};
    if (this.config.locales[fileName]
      && this.config.locales[fileName][currenLan]
      && Object.keys(this.config.locales[fileName][currenLan])) {
      locale = this.config.locales[fileName][currenLan];
    }
    try {
      merge(defaultLocale, locale);
    } catch (e) {
      this.logger.error(JSON.stringify({
        message: 'merge??????????????????????????????????????????',
      }));
    }
    this.locale = defaultLocale;
    // console.log(this.marketInfo);
    this.marketInfo.market.rate = this.rateInfo.rate;
    const { market = {} } = this.marketInfo;
    const { msg = {}, lan = {}, symbolAll = {} } = this.publicInfo;
    // console.log(this.publicInfo, 11111111);
    const { headerFooter = {} } = this;
    let customHeaderList = {};
    let headerNavList = [];
    let recommendMarket = [ 'BTC/USDT', 'ETH/USDT', 'TRX/USDT', 'XRP/USDT', 'DOT/USDT' ];
    if (headerFooter) {
      if (headerFooter.recommendSymbol) {
        recommendMarket = headerFooter.recommendSymbol.split(',');
      }
      if (headerFooter.header) {
        if (tempList.indexOf(this.publicInfo.switch.index_temp_type) > -1) {
          headerNavList = headerFooter.header;
        }
        try {
          customHeaderList = JSON.parse(headerFooter.header);
        } catch (e) {
          this.logger.error('?????????header??????json');
        }
      }
    }
    this.headerLink = this.getHeaderLink(ispc, domain);
    let securityUrl = this.publicInfo.common_user_behavior;
    if (this.publicInfo.common_user_behavior
      && this.publicInfo.common_user_behavior.length) {
      let str = this.publicInfo.common_user_behavior;
      if (str.indexOf('{deviceId}') !== -1) {
        str = str.replace('{deviceId}', '');
      }
      if (str.indexOf('{custID}') !== -1) {
        str = str.replace('{custID}', domain);
      }
      securityUrl = str;
    }
    // if (market && market.market && market.market.USDT) {
    //   const uMarket = market.market.USDT;
    //   recommendMarket = Object.keys(uMarket).slice(0, 5);
    // }
    this.logger.error(JSON.stringify({
      message: `????????????????????? ????????????---${this.ctx.request.header.host}???????????????---${this.ctx.request.url} ??????randomToken---${this.randomToken}`,
    }));
    let cusSkinId = '1';
    if (this.publicInfo.skin) {
      const skin = this.publicInfo.skin;
      cusSkinId = this.ctx.cookies.get('cusSkin', {
        signed: false,
      }) || skin.default;
    }
    const bannerList_1 = [
      {
        httpUrl: '',
        imageUrl: 'https://saas-oss.oss-cn-hongkong.aliyuncs.com/upload/20211026121715405.png',
      },
      {
        httpUrl: '',
        imageUrl: 'https://saas-oss.oss-cn-hongkong.aliyuncs.com/upload/20211026121740449.png',
      },
      {
        httpUrl: '',
        imageUrl: 'https://saas-oss.oss-cn-hongkong.aliyuncs.com/upload/20211026121755893.png',
      },
      {
        httpUrl: '',
        imageUrl: 'https://saas-oss.oss-cn-hongkong.aliyuncs.com/upload/20211026121811060.png',
      },
    ];
    const bannerList_2 = [
      {
        httpUrl: '',
        imageUrl: 'https://saas-oss.oss-cn-hongkong.aliyuncs.com/upload/20211026121557004.png',
      },
      {
        httpUrl: '',
        imageUrl: 'https://saas-oss.oss-cn-hongkong.aliyuncs.com/upload/20211026121633574.png',
      },
    ];
    let bannerList = cmsAdvertList;
    if (tempList.indexOf(this.publicInfo.switch.index_temp_type) > -1) {
      if (cmsAdvertList && cmsAdvertList.length) {
        bannerList = cmsAdvertList;
      } else if (this.publicInfo.switch.index_temp_type === '52') {
        bannerList = bannerList_2;
      } else {
        bannerList = bannerList_1;
      }
    }
    await ctx.render('./index.njk', {
      env: this.config.env,
      locale: this.locale,
      msg,
      headerLink: this.headerLink,
      headerList: this.getHeaderList(ispc),
      customHeaderList,
      headerSymbol: market ? market.headerSymbol : [],
      appDownLoad: this.appDownLoad,
      lanList: lan ? lan.lanList : [],
      lan,
      currenLan,
      seo: this.getSEO(),
      templateModule: this.getTemplate(ispc),
      ispc,
      headerTemplateModule: this.getHeaderTemplate(ispc),
      boxClass: ispc ? 'home-pc' : 'home-h5',
      coinList: market ? market.coinList : [],
      switch: this.publicInfo.switch,
      assetsList: this.assetsList(),
      orderList: this.orderList(),
      number: item => Number(item),
      colorList: this.getColorList(currenLan),
      noticeList: this.getNoticeList(noticeInfoList, currenLan),
      cmsAdvertList: ispc ? bannerList : cmsAppAdvertList,
      symbolAll,
      footer_warm_prompt,
      footerList: this.footerList,
      imgMap: this.getImgMap(),
      footerTemplate: headerFooter.footer,
      sourceMap: this.getSourceMap(),
      skin: this.publicInfo.skin ? this.publicInfo.skin : null,
      internationalTitle: {
        title: index_international_title1,
        subTitle: index_international_title2,
      },
      backgroundInfo: this.publicInfo.pc_background,
      securityUrl,
      isCoOpen: this.publicInfo.switch.index_temp_type.toString() === '9',
      coUrl: this.publicInfo.url.coUrl,
      coHeaderSymbol: (this.coPublicInfo && this.coPublicInfo.co_header_symbols && this.coPublicInfo.co_header_symbols.list && this.coPublicInfo.co_header_symbols.list.length) ? this.coPublicInfo.co_header_symbols.list : [],
      coHomeSymbol: (this.coPublicInfo && this.coPublicInfo.co_home_symbol_list && this.coPublicInfo.co_home_symbol_list.length) ? this.coPublicInfo.co_home_symbol_list : [],
      randomToken: this.randomToken,
      recommendMarket,
      headerNavList: this.handleNavList(headerNavList, domain),
      defaultFooter: this.getDefaultFooter(),
      cusSkinId,
    });
  }

  handleNavList(navList, domain) {
    const cookieDomain = domain === 'hiex.pro' ? 'bitwind.com' : domain;
    const { url } = this.publicInfo;
    const cookieIsNewSwap = this.ctx.cookies.get('isNewSwap', {
      signed: false,
    });
    let isNewSwap = false;
    if (cookieIsNewSwap) {
      if (cookieIsNewSwap === '1') {
        isNewSwap = true;
      } else {
        isNewSwap = false;
      }
    } else {
      if (this.publicInfo
            && this.publicInfo.switch.contract_version_settings === '1') {
        isNewSwap = true;
      } else {
        isNewSwap = false;
      }
    }
    this.ctx.cookies.set('isNewSwap', isNewSwap ? '1' : '0', {
      httpOnly: false,
      domain: cookieDomain,
    });
    if (url) {
      let coUrl = url.coUrl;
      if (url.coUrlNew || url.coUrlOld) {
        coUrl = isNewSwap ? url.coUrlNew : url.coUrlOld;
      }
      const formatList = navList.map(item => {
        const type = item.type ? item.type.toString() : '';
        if (type === '1') {
          item.httpUrl = url.exUrl + item.httpUrl;
        } else if (type === '2') {
          item.httpUrl = url.otcUrl + item.httpUrl;
        } else if (type === '3') {
          item.httpUrl = coUrl + item.httpUrl;
        }
        if (item.childList && item.childList.length) {
          item.childList = item.childList.map(child => {
            const subType = child.type ? child.type.toString() : '';
            if (subType === '1') {
              child.httpUrl = url.exUrl + child.httpUrl;
            } else if (subType === '2') {
              child.httpUrl = url.otcUrl + child.httpUrl;
            } else if (subType === '3') {
              child.httpUrl = url.coUrl + child.httpUrl;
            }
            return child;
          });
        }
        return item;
      });
      return formatList;
    }
  }

  getSEO() {
    const seo = this.publicInfo.seo || {};
    return {
      keywords: seo.keywords || '',
      description: seo.description || '',
      pageContent: seo.pageContent || '',
      title: seo.title || '',
    };
  }

  getTemplate(ispc) {
    let template = 'international';
    const indexTempType = this.publicInfo.switch.index_temp_type;
    // const indexTempType = '54';
    if (this.publicInfo.switch && templateConfig[indexTempType]) {
      template = templateConfig[indexTempType];
    }
    // 828727492???  ???????????????????????????
    if (!ispc && indexTempType !== '828727492') {
      template = 'h5';
    }
    return `modules/${template}.njk`;
  }

  getHeaderTemplate(ispc) {
    let template = 'china';
    const tempList = [ '51', '52', '53', '54' ];
    const { index_temp_type, header_navigation_type } = this.publicInfo.switch;
    if (!ispc) {
      template = 'h5';
    }
    if (tempList.indexOf(index_temp_type) > -1) {
      template = header_navigation_type && header_navigation_type.toString() === '1' ? 'v5_1' : 'v5_2';
    }
    return `modules/header/${template}.njk`;
  }

  getDefaultFooter() {
    let template = 'china';
    const tempList = [ '51', '52', '53', '54' ];
    const { index_temp_type } = this.publicInfo.switch;
    if (tempList.indexOf(index_temp_type) > -1) {
      if (index_temp_type === '51' || index_temp_type === '53') {
        template = 'chinaNew';
      } else {
        template = 'chinaNew';
      }
    }
    return `modules/footer/${template}.njk`;
  }

  getSelectSkin() {
    if (!this.publicInfo.skin) {
      return null;
    }
    const skin = this.publicInfo.skin;
    const id = this.ctx.cookies.get('cusSkin', {
      signed: false,
    }) || skin.default;
    const list = skin.listist;
    const currentList = [];
    list.forEach(item => {
      if (item.skinId === id) {
        currentList.push(item);
      }
    });
    return {
      skinTypeId: skin.skinTypeId,
      listist: currentList,
      default: skin.default,
    };
  }

  getSkin(fileName, fileBasePath) {
    let obj = {};
    try {
      obj = JSON.parse(fs.readFileSync(path.join(fileBasePath, `${fileName}.json`), 'utf-8'));
      // eslint-disable-next-line no-empty
    } catch (err) {

    }
    if (!Object.keys(obj).length) {
      obj = this.publicInfo.skin;
    }

    return obj;
  }

  getSourceMap() {
    let sourceMap = {};
    try {
      sourceMap = JSON.parse(fs.readFileSync(path.join(__dirname, '../view/src/utils/imgMap.json'), 'utf-8'));
    } catch (e) {

    }
    try {
      if (this.publicInfo.skin) {
        const skin = this.publicInfo.skin;
        const id = this.ctx.cookies.get('cusSkin', {
          signed: false,
        }) || skin.default;
        skin.listist.forEach(item => {
          if (item.skinId === id) {
            const imgList = item.imgList;
            Object.keys(sourceMap).forEach(ikey => {
              if (imgList[ikey]) {
                let imgSrc = imgList[ikey];
                if (imgSrc.indexOf('http') === -1) {
                  imgSrc = item.imgPath + imgSrc;
                }
                sourceMap[ikey] = imgSrc;
              }
            });
          }
        });
      }
    } catch (e) {

    }

    return sourceMap;
  }

  getImgMap() {
    const homeImgList = [
      'home_edit_imga', 'home_edit_imgb', 'home_edit_bg', 'home_edit_icon', 'home_edit_icon1',
      'home_edit_icon2', 'home_edit_icon3', 'home_edit_icon4', 'inforHeadBg', 'head', 'inforHeadBg',
      'int_banner', 'int_logo', 'interAppBg', 'interBanner_1', 'interBanner_2', 'interBanner_3',
      'interBanner_4', 'interCcustom1', 'interCcustom2', 'interCcustom3', 'interCcustom4', 'interHomeA',
      'interPhone', 'home_guide_1', 'home_guide_2', 'home_guide_3', 'home_service_1', 'home_service_2',
      'home_service_3', 'home_service_4', 'home_appview_1', 'home_appview_2', 'home_appview_3', 'home_appview_4',
      'foot-icon1', 'foot-icon2', 'foot-icon3',
      'foot-icon1-hover', 'foot-icon1-hover', 'foot-icon1-hover',
    ];
    const imgMap = JSON.parse(fs.readFileSync(path.join(__dirname, '../view/src/utils/imgMap.json'), 'utf-8'));
    const hImg = {};
    homeImgList.forEach(item => {
      if (imgMap[item]) {
        hImg[item] = imgMap[item];
      }
    });
    return JSON.stringify(hImg);
  }

  getNoticeList(noticeInfoList, curLan) {
    if (!this.publicInfo.switch) {
      return [];
    }
    const tempList = [ '51', '52', '53', '54' ];
    const { index_international_open, index_temp_type } = this.publicInfo.switch;
    if (tempList.indexOf(index_temp_type) > -1) {
      const arr = [];
      noticeInfoList.forEach(item => {
        arr.push({
          noticeText: item.title,
          id: item.id,
        });
      });
      return arr.slice(0, 3);
    }
    if (noticeInfoList && noticeInfoList.length) {
      const arr = [];
      let length = 18;
      if (index_international_open === 1) {
        length = 50;
      }
      if (curLan === 'en_US') {
        length = 36;
      }
      noticeInfoList.forEach(item => {
        const space = item.title.length > length ? '...' : '';
        arr.push({
          noticeText: `${item.title.substr(0, length)}${space}`,
          id: item.id,
        });
      });
      return arr.slice(0, 3);
    }
    return [];
  }

  getColorList(lan) {
    const { skin } = this.publicInfo;
    if (!skin) {
      return [];
    }
    let sk = skin.default;
    const cusSkin = this.ctx.cookies.get('cusSkin', {
      signed: false,
    });
    if (cusSkin && cusSkin !== 'undefined') {
      sk = cusSkin;
    }
    const list = [];
    const lis = skin.listist;
    lis.forEach(item => {
      let name = item.mainClor;
      if (item.skinName && item.skinName[lan]) {
        name = item.skinName[lan];
      }
      const obj = {
        mainClor: name,
        skinId: item.skinId,
      };
      if (item.skinId === sk) {
        obj.checked = 'checked';
      }
      list.push(obj);
    });
    return list;
  }

  __getLocale(val) {
    const arr = val.split('.');
    let locale = this.locale;
    let geted = true;
    arr.forEach(item => {
      if (locale[item]) {
        locale = locale[item];
      } else {
        geted = false;
      }
    });
    return geted ? locale : val;
  }

  orderList() {
    const arr = [];
    const pubSwitch = this.publicInfo.switch;
    const { headerLink } = this;
    if (!pubSwitch) {
      return arr;
    }
    if (headerLink.trade && pubSwitch.ieo_pool_hide !== '1') {
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
    if (pubSwitch.ieo_pool_hide === '1') {
      arr.push({
        //  '????????????',
        title: this.__getLocale('order.ipfsOrder.title'),
        link: '/order/ipfsOrder',
      });
    }
    if (pubSwitch.mortgage_borrow_hide === '1') {
      arr.push({
        //  '????????????',
        title: this.__getLocale('broToloan.common.order'),
        link: '/order/toLoanOrder',
      });
    }
    return arr;
  }

  assetsList() {
    const arr = [];
    const { headerLink } = this;
    const pubSwitch = this.publicInfo.switch;
    if (!this.publicInfo.switch) {
      return arr;
    }
    if (headerLink.trade || pubSwitch.ieo_pool_hide === '1') {
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
    let fileLan = '';
    if (lan) {
      fileLan = `${lan}-`;
    }
    try {
      obj = JSON.parse(fs.readFileSync(path.join(fileBasePath, `${fileLan}${fileName}.json`), 'utf-8'));
      // eslint-disable-next-line no-empty
    } catch (err) {

    }
    return obj.data;
  }

  getHeaderLink(ispc, domain) {
    const cookieDomain = domain === 'hiex.pro' ? 'bitwind.com' : domain;
    const { url } = this.publicInfo;
    const cookieIsNewSwap = this.ctx.cookies.get('isNewSwap', {
      signed: false,
    });
    let isNewSwap = false;
    const currenLan = this.ctx.request.path.split('/')[1];
    if (cookieIsNewSwap) {
      if (cookieIsNewSwap === '1') {
        isNewSwap = true;
      } else {
        isNewSwap = false;
      }
    } else {
      if (this.publicInfo
            && this.publicInfo.switch.contract_version_settings === '1') {
        isNewSwap = true;
      } else {
        isNewSwap = false;
      }
    }
    this.ctx.cookies.set('isNewSwap', isNewSwap ? '1' : '0', {
      httpOnly: false,
      domain: cookieDomain,
    });
    if (url) {
      let coUrl = url.coUrl;
      if (url.coUrlNew || url.coUrlOld) {
        coUrl = isNewSwap ? url.coUrlNew : url.coUrlOld;
      }
      return {
        home: url.exUrl,
        trade: url.exUrl ? `${url.exUrl}/trade` : '',
        market: url.exUrl ? `${url.exUrl}/market` : '',
        otc: url.otcUrl,
        lever: url.exUrl ? `${url.exUrl}/margin` : '',
        co: ispc ? coUrl ? `${coUrl}/${currenLan}/` : '' : '',
        proSwap: url.coUrl ? `${url.coUrl}/${currenLan}/proSwap` : '',
        proTrade: url.exUrl ? `${url.exUrl}/proTrade` : '',
        prolever: url.exUrl ? `${url.exUrl}/proTradeMargin` : '',
      };
    }
    return {};
  }


  getHeaderList(ispc, domain) {
    const arr = [];
    const pubSwitch = this.publicInfo.switch;
    const { headerLink } = this;
    if (!pubSwitch) { return arr; }
    let tradeProConfig = {
      exproisOpen: '0',
      marginproisOpen: '0',
      swapproisOpen: '0',
    };
    if (this.publicInfo.custom_config) {
      const customConfigData = this.publicInfo.custom_config;
      let customConfig = null;
      if (customConfigData) {
        try {
          customConfig = JSON.parse(customConfigData);
        } catch (e) {
          console.log('custom_config ????????????');
        }
        if (customConfig && customConfig.trade_pro_config
            && customConfig.trade_pro_config.exproisOpen) {
          tradeProConfig = customConfig.trade_pro_config;
        }
      }
    }


    // ??????
    if (pubSwitch.index_kline_switch === '1' && ispc) {
      arr.push({
        title: this.__getLocale('header.market'),
        activeId: 'market',
        link: headerLink.market,
      });
    }

    // ????????????
    // exchange_hide 0: ?????????????????? 1?????????????????????
    if (headerLink.trade && pubSwitch.exchange_hide !== '0') {
      let selectList = null;
      if (tradeProConfig.exproisOpen === '1') {
        selectList = [
          {
            activeId: 'exTrade',
            link: headerLink.trade,
            title: this.__getLocale('header.ord'), // '?????????',
          },
          {
            activeId: 'proTrade',
            link: headerLink.proTrade,
            title: this.__getLocale('header.pro'), // '?????????',
          },
        ];
      }
      arr.push({
        title: this.__getLocale('header.trade'),
        activeId: 'exTrade',
        link: headerLink.trade,
        icon: 'icon-b_5',
        selectList,
      });
    }
    // ??????
    /*    if (headerLink.otc) {
      arr.push({
        title: Number(pubSwitch.fiatTradeOpen) ?
          this.__getLocale('assets.b2c.otcShow.header') : this.__getLocale('header.otc'),
        activeId: 'otcTrade',
        link: headerLink.otc,
      });
    }*/
    const otcArr = [];
    const otcObj = {
      title: this.__getLocale('pageTitle.fiatdeal'),
      activeId: 'otcTrade',
      link: headerLink.otc,
      icon: 'icon-b_6',
    };
    if (headerLink.otc) {
      otcArr.push(otcObj);
    }
    // ?????????
    if (Number(pubSwitch.middleman_config_open) && ispc) {
      otcArr.push({
        title: this.__getLocale('creditCard.title'),
        activeId: 'crad',
        link: `/${this.lan}/creditCard`,
      });
    }
    if (otcArr.length) {
      let otcHeader = {};
      if (otcArr.length > 1) {
        otcHeader = {
          title: this.__getLocale('header.otc'),
          activeId: 'otcTrade',
          link: headerLink.otc,
          icon: 'icon-b_6',
        };
      } else if (headerLink.otc) {
        otcHeader = {
          title: this.__getLocale('header.otc'),
          activeId: 'otcTrade',
          link: headerLink.otc,
          icon: 'icon-b_6',
        };
      } else {
        const [ vc ] = otcArr;
        otcHeader = vc;
      }
      if (otcArr.length > 1) {
        otcHeader.selectList = JSON.parse(JSON.stringify(otcArr));
        otcHeader.isOtcList = true;
      }
      arr.push(otcHeader);
    }

    // ????????????
    if (!headerLink.otc && Number(pubSwitch.saas_otc_flow_config)) {
      arr.push({
        title: this.__getLocale('mobilityTrade.immediately'),
        activeId: 'otcTrade',
        link: '/mobility',
      });
    }
    // ??????
    if (headerLink.co) {
      let coselectList = null;
      // ???????????????????????????????????????
      if (tradeProConfig.swapproisOpen === '1') {
        coselectList = [
          {
            activeId: 'proCo',
            link: headerLink.co,
            title: this.__getLocale('header.ord'), // '?????????',
          },
          {
            activeId: 'proTrade',
            link: headerLink.proSwap,
            title: this.__getLocale('header.pro'), // '?????????',
          },
        ];
      }
      arr.push({
        title: this.__getLocale('header.co'),
        activeId: 'coTrade',
        link: headerLink.co,
        icon: 'icon-b_23',
        selectList: coselectList,
      });
    }
    // ??????
    if (Number(pubSwitch.lever_open)) {
      // ????????????????????????????????????
      let leverselectList = null;
      if (tradeProConfig.marginproisOpen === '1') {
        leverselectList = [
          {
            activeId: 'marginTrade',
            link: headerLink.lever,
            title: this.__getLocale('header.ord'), // '?????????',
          },
          {
            activeId: 'marginProTrade',
            link: headerLink.prolever,
            title: this.__getLocale('header.pro'), // '?????????',
          },
        ];
      }
      arr.push({
        title: this.__getLocale('header.lever'),
        activeId: 'marginTrade',
        link: headerLink.lever,
        icon: 'icon-b_24',
        selectList: leverselectList,
      });
    }
    // etf
    // ????????????
    if (ispc && pubSwitch.etfOpen && pubSwitch.etfNavigationSwitch === '1') {
      arr.push({
        title: this.__getLocale('etfAdd.title'),
        activeId: 'etf',
        link: this.etfUrl(),
      });
    }
    return arr;
  }

  etfUrl() {
    let str = '';
    const { market } = this.publicInfo;
    if (market) {
      const etfArr = [];
      if (market.market.ETF && market.market.ETF.length) {
        Object.keys(market.market.ETF).forEach(ci => {
          etfArr.push(market.market.ETF[ci]);
        });
        if (etfArr.length) {
          const symbol = etfArr.sort(compare('sort'))[0];
          const name = symbol.showName || symbol.name;
          str = name.replace('/', '_');
        }
      }
    }
    return `${this.headerLink.trade}/${str}`;
  }

  setLan(domain) {
    const { lan } = this.publicInfo;
    // ??????client???????????? clientUrlLan
    const clientUrlLan = this.ctx.request.path.split('/')[1];
    // ??????client cookie????????? clientCookLan
    const clientCookLan = this.ctx.cookies.get('lan', {
      signed: false,
    });
    const cookieDomain = domain === 'hiex.pro' ? 'bitwind.com' : domain;
    const dLan = 'en_US';
    const reg = /^[a-z]{2}_[A-Z]{2}$/;
    // ?????????????????????
    const language = this.ctx.header['accept-language'];
    let lanKey = '';
    if (language) {
      lanKey = language.split(',')[0];
    }
    const lanListObj = {
      // ??????
      en: 'en_US',
      'en-au': 'en_US',
      'en-ca': 'en_US',
      'en-gb': 'en_US',
      'en-nz': 'en_US',
      'en-us': 'en_US',
      'en-za': 'en_US',
      // ????????????
      zh: 'zh_CN',
      'zh-cn': 'zh_CN',
      // ????????????
      'zh-tw': 'el_GR',
      'zh-hk': 'el_GR',
      // ??????
      ja: 'ja_JP',
      'ja-jp': 'ja_JP',
      // ??????
      vi: 'vi_VN',
      'vi-vn': 'vi_VN',
      // ??????
      ko: 'ko_KR',
      'ko-kr': 'ko_KR',
      'ko-kp': 'ko_KR',
      // ?????????
      es: 'es_ES',
      'es-es': 'es_ES',
      'es-mx': 'es_ES',
    };
    if (lan) {
      // ?????? publicInfo => lan => defLan ????????????
      let serverDefLan = lan.defLan || 'en_US';
      // let serverDefLan = 'none';
      if (serverDefLan) {
        // ???????????????????????????????????? none ???????????????????????????
        if (serverDefLan === 'none') {
          // ??????????????????????????? ???lanListObj???????????? ?????????????????????
          lanKey = lanKey.toLowerCase();
          serverDefLan = lanListObj[lanKey] ? lanListObj[lanKey] : dLan;
        }
      } else {
        const errorData = {
          domain,
          message: `?????????publicInfo.lan.defLan??????, ??????????????????${serverDefLan}`,
          key: 'publicInfo.lan.defLan',
          data: lan.defLan,
        };
        if (!hostFilter.test(domain)) {
          this.logger.error(JSON.stringify(errorData));
        }
      }
      // ?????? publicInfo => lan => lanList ????????????
      let severLanList = [];
      if (lan.lanList instanceof Array) {
        severLanList = lan.lanList;
      } else {
        const errorData = {
          domain,
          message: '?????????publicInfo.lan.lanList??????, ??????[]',
          key: 'publicInfo.lan.lanList',
          data: lan.lanList,
        };
        if (!hostFilter.test(domain)) {
          this.logger.error(JSON.stringify(errorData));
        }
      }
      // ???????????? lans
      const lans = [];
      if (severLanList.length) {
        severLanList.forEach(item => {
          lans.push(item.id);
        });
      } else {
        lans.push(dLan);
      }
      // ??????url??????????????????????????????cookie
      if (lans.indexOf(clientUrlLan) !== -1) {
        this.ctx.cookies.set('lan', clientUrlLan, {
          httpOnly: false,
          domain: cookieDomain,
        });
      } else {
        if (lans.indexOf(serverDefLan) === -1) {
          serverDefLan = dLan;
        }
        const lan = lans.indexOf(clientCookLan) !== -1 ? clientCookLan : serverDefLan;
        let redirectUrl = '';
        if (reg.test(clientUrlLan)) {
          const vu = this.ctx.request.url.split(`/${clientUrlLan}`)[1];
          redirectUrl = vu;
        } else {
          redirectUrl = this.ctx.request.url;
        }
        this.ctx.cookies.set('lan', lan, {
          httpOnly: false,
          domain: cookieDomain,
        });
        this.ctx.redirect(`/${lan}${redirectUrl}`, 302);
      }

      this.lan = clientUrlLan;
    } else {
      const errorData = {
        domain,
        message: `?????????publicInfo.lan??????, ??????????????????${dLan}`,
        key: 'publicInfo.lan',
        data: lan,
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
        this.ctx.cookies.set('lan', dLan, {
          httpOnly: false,
          domain: cookieDomain,
        });
        this.ctx.redirect(`/${dLan}${redirectUrl}`, 302);
      }
      this.lan = clientUrlLan;
    }
  }
}

module.exports = StaticIndex;
