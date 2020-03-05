const fs = require('fs');
const path = require('path');
const hostFilter = require('../utils/host-filter');
const dirExists = require('../utils/mkdir');

const getSetData = async (domainData, host, app, fileBasePath, api) => {
  dirExists(fileBasePath);
  const serverConfigPath = path.join(__dirname, './../../serverConfig.json');
  let urlHost = 'http://127.0.0.1';
  let apiProxy = '/fe-ex-api';
  let headersHost = '';
  if (fs.existsSync(serverConfigPath)) {
    const jsonData = JSON.parse(fs.readFileSync(serverConfigPath, 'utf8'));
    urlHost = jsonData.curlHost;
    apiProxy = jsonData.proxy;
    headersHost = jsonData.headerHost;
  }
  if (domainData) {
    let header = {
      host: headersHost.length
        ? `${headersHost}.${domainData.fileName}`
        : host,
    };
    if (app.config.env === 'local') {
      urlHost = app.config.devUrlProxy.ex;
      header = {};
    }
    const res = await app.ctx.curl(`${urlHost}${apiProxy}/${api}`, {
      dataType: 'json',
      method: 'POST',
      timeout: '30000',
      headers: header,
    });
    if (res.status === 200 && res.data.code.toString() === '0') {
      fs.writeFile(`${fileBasePath}${domainData.fileName}.json`, JSON.stringify({ data: res.data.data }, 'utf8'), (error) => {
        if (error) {
          const errorData = {
            domain: domainData.domainName, // 域名
            message: `${api} 保存失败`, // 描述
            error,
          };
          if (!hostFilter.test(domainData.domainName)) {
            app.logger.error(JSON.stringify(errorData));
          }
        }
        const errorData = {
          domain: domainData.domainName, // 域名
          message: `${api} 请求成功`, // 描述
        };
        if (!hostFilter.test(domainData.domainName)) {
          app.logger.error(JSON.stringify(errorData));
        }
      });
    } else {
      const errorData = {
        domain: domainData.domainName, // 域名
        message: res.status === 200 ? `${api}报错 code非0` : `${api}报错 status非200`, // 描述
        key: res.status === 200 ? 'res.data.message' : 'res.status', // key
        data: res.status === 200 ? JSON.stringify(res.data) : res.status, // value
      };
      if (!hostFilter.test(domainData.domainName)) {
        app.logger.error(JSON.stringify(errorData));
      }
    }
  }
};

module.exports = getSetData;
