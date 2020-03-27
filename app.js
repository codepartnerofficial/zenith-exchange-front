const util = require('util');
const Transport = require('egg-logger').Transport;
const path = require('path');
const fs = require('fs');

module.exports = (app) => {
  let argv = {};
  try {
    argv = JSON.parse(process.argv[2]);
  } catch (e) {

  }

  if (argv.buildEnv) {
    app.config.buildEnv = argv.buildEnv;
  }

   // 远程拉取数据 存储地址
  if (app.config.env === 'local') {
    app.config.staticPath = path.join(__dirname, './app/public/serverData/');
    app.config.skinsPath = path.join(__dirname, './app/public/siknData/');
    app.config.localesPath = path.join(__dirname, './app/public/Locales/');
    app.config.footerHeaderPath = path.join(__dirname, './app/public/footerHeader/');
    app.config.appDownLoadPath = path.join(__dirname, './app/public/appDownLoadPath/');
    app.config.bannerIndexPath = path.join(__dirname, './app/public/bannerIndex/');
    app.config.footerList = path.join(__dirname, './app/public/footerList/');
  } else {
    app.config.staticPath = path.join(__dirname, './../exchange-fe-server-static/publicInfo/');
    app.config.skinsPath = path.join(__dirname, './../exchange-fe-server-static/skinData/');
    app.config.footerHeaderPath = path.join(__dirname, './../exchange-fe-server-static/footerHeader/');
    app.config.appDownLoadPath = path.join(__dirname, './../exchange-fe-server-static/appDownLoadPath/');
    app.config.bannerIndexPath = path.join(__dirname, './../exchange-fe-server-static/bannerIndex/');
    app.config.footerList = path.join(__dirname, './../exchange-fe-server-static/footerList/');
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
  app.config.domainArr = domainArr;
};
