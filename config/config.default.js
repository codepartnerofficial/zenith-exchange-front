/* eslint valid-jsdoc: "off" */


const path = require('path');
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   * */
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = `${appInfo.name}_1572334094719_3964`;

  // add your middleware config here
  config.middleware = ['compress', 'conditional', 'etag'];

  config.compress = {
    threshold: 1024,
  },

  config.static = {
    prefix: '/',
    gzip: true,
    maxAge: 365 * 24 * 60 * 60,
    usePrecompiledGzip: true,
    dir: path.join(__dirname, '../app/dist'),
  };

  config.logger = {
    disableConsoleAfterReady: false
  };

  let templatePath = 'build';
 /* if (appInfo.env === 'local'){
    templatePath = 'view';
  }*/

  config.view = {
    root: [
      path.join(__dirname, `../app/${templatePath}/template`),
    ].join(','),
    mapping: {
      '.njk':'nunjucks',
    },
  };

  // 禁用csrf攻击预警
  config.security = {
    csrf: {
      enable: false
    }
  }
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };
  config.devUrlProxy = {
<<<<<<< HEAD
     ex: 'http://www.taobao.com/',
=======
     ex: 'https://www.mkex.me',
>>>>>>> a6ed3eab7fc0fee5fc2fcfa1bee05e2f89c25d94
    //ex:'https://www.vbcoin.ooo',
    otc: 'https://www.mkex.me',
    co: 'https://www.mkex.me'
  }

  return {
    ...config,
    ...userConfig,
  };
};
