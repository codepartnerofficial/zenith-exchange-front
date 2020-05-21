const { getIPAddress } = require('BlockChain-ui/node/utils');
const path = require('path');
const fs = require('fs');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }
  configWillLoad(){
    const { app } = this;
    let argv = {};
    const serverConfigPath = path.join(__dirname, './serverConfig.json');
    try {
      argv = JSON.parse(process.argv[2]);
    } catch (e) {

    }

    if (argv.buildEnv) {
      app.config.buildEnv = argv.buildEnv;
    }
    app.config.staticKey = 'serverData';
    app.config.skinsKey = 'siknData';
    app.config.localesKey = 'Locales';
    app.config.footerHeaderKey = 'footerHeader';
    app.config.appDownLoadKey = 'appDownLoad';
    app.config.bannerIndexKey = 'bannerIndex';
    app.config.footerListKey = 'footerList';
    // 远程拉取数据 存储地址
    if (app.config.env === 'local') {
      app.config.staticDir = './app/public';
    } else {
      app.config.staticDir = './../exchange-fe-server-static';
    }
    app.config.staticPath = path.join(__dirname, app.config.staticDir, 'serverData/');
    app.config.skinsPath = path.join(__dirname, app.config.staticDir, 'siknData/');
    app.config.localesPath = path.join(__dirname, './node_modules/BlockChain-ui/Locales/web');
    app.config.footerHeaderPath = path.join(__dirname, app.config.staticDir, 'footerHeader/');
    app.config.appDownLoadPath = path.join(__dirname, app.config.staticDir, 'appDownLoadPath/');
    app.config.bannerIndexPath = path.join(__dirname, app.config.staticDir, 'bannerIndex/');
    app.config.footerList = path.join(__dirname, app.config.staticDir, 'footerList/');
    app.config.filePathMap = {};
    app.config.filePathMap[app.config.staticKey] = app.config.staticPath;
    app.config.filePathMap[app.config.skinsKey] = app.config.skinsPath;
    app.config.filePathMap[app.config.localesKey] = app.config.localesPath;
    app.config.filePathMap[app.config.footerHeaderKey] = app.config.footerHeaderPath;
    app.config.filePathMap[app.config.appDownLoadKey] = app.config.appDownLoadPath;
    app.config.filePathMap[app.config.bannerIndexKey] = app.config.bannerIndexPath;
    app.config.filePathMap[app.config.footerListKey] = app.config.footerList;
    if (fs.existsSync(app.config.staticDir)) {
      fs.mkdirSync(app.config.staticDir);
    }
    if (fs.existsSync(serverConfigPath)) {
      const jsonData = JSON.parse(fs.readFileSync(serverConfigPath, 'utf8'));
      app.config.serverUrlConfig = jsonData;
    }

    // 域名配置文件
    let configDomainPath = path.join(app.config.staticPath, 'pageDomain.json');
    app.config.configDomain = {}
    if (fs.existsSync(configDomainPath)) {
      app.config.configDomain = JSON.parse(fs.readFileSync(configDomainPath, 'utf8'));
    }

    const staticDomainPath = path.join(app.config.staticPath, 'staticDomain.json');
    app.config.staticDomain = '';
    if(fs.existsSync(staticDomainPath)){
      app.config.staticDomain = JSON.parse(fs.readFileSync(staticDomainPath, 'utf8')).staticDomain;
    }
    const domainArrPath = path.join(app.config.staticPath, 'domainList.json');
    let domainArr = {};
    if (fs.existsSync(domainArrPath)) {
      domainArr = JSON.parse(fs.readFileSync(domainArrPath, 'utf8'));
    }

    app.config.serverData = {
      serverData: {},
      siknData: {},
      Locales: {
        defaultLocales: {},
      },
      footerHeader: {},
      appDownLoad: {},
      bannerIndex: {},
      footerList: {},
    };

    if (fs.existsSync(app.config.staticPath)){
      fs.readdirSync(app.config.staticPath).forEach((item) => {
        const content = fs.readFileSync(`${app.config.staticPath}/${item}`, 'utf-8');
        app.config.serverData.serverData[item] = JSON.parse(content);
      });
    }

    if (fs.existsSync(app.config.skinsPath)){
      fs.readdirSync(app.config.skinsPath).forEach((item) => {
        const content = fs.readFileSync(`${app.config.skinsPath}/${item}`, 'utf-8');
        app.config.serverData.siknData[item] = JSON.parse(content);
      });
    }
    if (fs.existsSync(app.config.footerHeaderPath)){
      fs.readdirSync(app.config.footerHeaderPath).forEach((item) => {
        const content = fs.readFileSync(`${app.config.footerHeaderPath}/${item}`, 'utf-8');
        app.config.serverData.footerHeader[item] = JSON.parse(content);
      });
    }
    if (fs.existsSync(app.config.appDownLoadPath)){
      fs.readdirSync(app.config.appDownLoadPath).forEach((item) => {
        const content = fs.readFileSync(`${app.config.appDownLoadPath}/${item}`, 'utf-8');
        app.config.serverData.appDownLoad[item] = JSON.parse(content);
      });
    }
    if (fs.existsSync(app.config.bannerIndexPath)){
      fs.readdirSync(app.config.bannerIndexPath).forEach((item) => {
        const content = fs.readFileSync(`${app.config.bannerIndexPath}/${item}`, 'utf-8');
        app.config.serverData.bannerIndex[item] = JSON.parse(content);
      });
    }
    if (fs.existsSync(app.config.footerList)){
      fs.readdirSync(app.config.footerList).forEach((item) => {
        const content = fs.readFileSync(`${app.config.footerList}/${item}`, 'utf-8');
        app.config.serverData.footerList[item] = JSON.parse(content);
      });
    }

    if (fs.existsSync(app.config.localesPath)){
      fs.readdirSync(app.config.localesPath).forEach((fileName) => {
        app.config.serverData.Locales['defaultLocales'][fileName] = require(`BlockChain-ui/locales/web/${fileName}`);
      });
    }
    app.config.LOCAL_IP = getIPAddress();
    app.config.domainArr = domainArr;
  }
}

module.exports = AppBootHook;
