import axios from 'axios';
import bus from '../bus';
import { getCookie } from '@/utils';
// import md5 from 'js-md5'
const formatTime = (dateTime) => {
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  function s(t) {
    return t < 10 ? `0${t}` : t;
  }

  return `${year}-${s(month)}-${s(day)} ${s(hours)}:${s(minutes)}:${s(seconds)}`;
};
// 参数
const formatParams = (acParams = {}) => {
  let data;
  const {
    org, device, language, platform, timezone, adblock, userAgent, plugins,
    sessionStorage, localStorage, indexedDb, touchSupport,
    fonts, availableScreenResolution, screenResolution,
  } = window.secur;
  const securityInfo = JSON.stringify({
    id: '',
    org,
    timestamp: formatTime(new Date().getTime()),
    userAgent,
    availableScreenResolution,
    screenResolution,
    touchSupport,
    sessionStorage,
    localStorage,
    indexedDb,
    plugins,
    fonts,
    adblock,
    client_type: '',
    identity: '',
    device,
    ip: '',
    ip2region: '',
    language,
    platform,
    browser: '',
    browser_version: '',
    os: '',
    os_version: '',
    resolution: '',
    timezone,
    ctime: '',
    mtime: '',
  });
  if (Object.prototype.toString.call(acParams) === '[object FormData]') {
    acParams.append('uaTime', formatTime(new Date().getTime()));
    acParams.append('securityInfo', securityInfo);
    data = acParams;
  } else {
    data = { ...acParams };
    data.uaTime = formatTime(new Date().getTime());
    data.securityInfo = securityInfo;
  }
  return data;
};
// 请求头
const formatHeaders = (acHeaders) => {
  let headers = {};
  headers['exchange-token'] = getCookie('token') || 'c5fa97c1140aafea1ef1e84b67503d5e0db18d0ca0ff4819a0ca3f24722407df';
  headers['exchange-client'] = 'pc';
  headers['exchange-language'] = getCookie('lan') || 'zh_CN';
  // headers['Content-type'] = 'application/x-www-form-urlencoded'
  // headers['exchange-time'] = formatTime(new Date().getTime())
  if (acHeaders) {
    headers = { ...headers, ...acHeaders };
  }
  return headers;
};

const request = function request(prefix, url, headers, params, method, hostType, resolve, reject) {
  return axios({
    url: `${prefix}${url}`, // exchange-web-api线上  vue-api本地
    headers: formatHeaders(headers),
    data: formatParams(params),
    method: method || 'post',
  }).then((data) => {
    if (data.data.code) {
      if (data.data.code.toString() === '10002') {
        bus.$emit('outUserIsLogin');
      }
    }
    resolve(data.data);
  }).catch((err) => {
    reject(err);
    throw new Error(`Error:${err}`);
  });
};

const http = ({
  url, headers, params, method, hostType,
}) => {
  let prefix = '';
  switch (hostType) {
    case 'otc':
      prefix = '/fe-otc-api/'; // 场外
      break;
    case 'co':
      prefix = '/fe-co-api/'; // 场內
      break;
    case 'upload':
      prefix = '/fe-upload-api/'; // 上传
      break;
    case 'financing':
      prefix = '/fe-financing-api/'; // 场內
      break;
    case 'def':
      prefix = '';
      break;
    default:
      prefix = '/fe-ex-api/'; // 公共和交易所
  }
  return new Promise((resolve, reject) => {
    if (!window.secur) {
      const msec = { org: window.location.host, server: '', sendRemote: false };
      window.security.init(msec, (info) => {
        window.secur = info;
        request(prefix, url, headers, params, method, hostType, resolve, reject);
      });
    } else {
      request(prefix, url, headers, params, method, hostType, resolve, reject);
    }
  });
};
export default http;
