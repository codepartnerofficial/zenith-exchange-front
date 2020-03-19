(function () {
  const { myStorage, setDefaultMarket } = BlockChainUtils;
  const lang = window.location.href.match(/[a-z]+_[A-Z]+/)[0];
  const listenMap = [];
  const recommendDataList = {};
  let marketDataObj = [];
  const klineDataList = {};
  webWorkerMap.baseUrl = '/';
  if (!window.workers) {
    window.workers = new Worker(`/static/web-worker/${webWorkerMap.websocket}?fileMap=${JSON.stringify(webWorkerMap)}`);
  }

  const webSocketSend = (type, sendType, symbolData, symbolList) => {
    workers.postMessage({
      type: 'WEBSOCKET_SEND',
      data: {
        type,
        sendType,
        symbolData,
        symbolList,
      },
    });
  };

  // 格式化 推荐位的 K线数据
  const setRecommendData = (headerSymbol, coinList, coinTagLangs) => {
    if (headerSymbol.length) {
      headerSymbol.forEach((item) => {
        recommendDataList[item] = {};
        if (marketDataObj && marketDataObj[item]) {
          recommendDataList[item] = marketDataObj[item];
        }
      });
      emitter.emit('RECOMMEEND_DATA', {
        recommendDataList,
        coinList,
        coinTagLangs: coinTagLangs[lang],
      });
    }
  }

  const listenWSData = (data , headerSymbol, coinList, coinTagLangs) => {
    const { type, WsData } = data;
    // 24小时行情数据
    if (type === 'MARKET_DATA') {
      marketDataObj = WsData;
      //this.setMarketData();
      setRecommendData(headerSymbol, coinList, coinTagLangs);
    }
    if (type.indexOf('KLINE_DATA') > -1) {
      if (headerSymbol.length) {
        headerSymbol.forEach((key) => {
          const [, symbolType] = WsData.channel.split('_');
          const symbolArr = key.toLowerCase().split('/');
          const symbol = symbolArr[0] + symbolArr[1];
          if (symbol === symbolType) {
            if (WsData.event_rep === 'rep') {
              const kData = WsData.data;
              klineDataList[key] = [];
              const lengthNumber = kData.slice(-20);
              lengthNumber.forEach((item) => {
                klineDataList[key].push([
                  item.id,
                  item.close,
                ]);
              });
            } else {
              const kData = WsData.tick;
              const keyYs = klineDataList[key] || [];
              const lengths = keyYs.length;
              if (klineDataList[key].length) {
                const lastId = klineDataList[key][lengths - 1][0];
                if (lastId === kData.id) {
                  klineDataList[key].pop();
                }
                if (klineDataList[key].length > 20) {
                  klineDataList[key].shift();
                }
                klineDataList[key].push([
                  kData.id,
                  kData.close,
                ]);
              }
            }
          }
        });
        emitter.emit('RECOMMEEND_KLINE_DATA', klineDataList);
      }
    }
  };

  const initWorker = (data) => {
    const { market, symbolAll } = data;
    const { coinList, coinTagLangs } = market;
    const marketCurrent = myStorage.get('homeMarkTitle');
    const symbolCurrent = myStorage.get('sSymbolName');
    workers.postMessage({
      type: 'CREAT_WEBSOCKET',
      data: {
        wsUrl: market.wsUrl,
        lan: lang,
        rate: market.rate,
        symbolAll: symbolAll,
      },
    });

    const getSymbolList = (currentMarketList) => {
      // 如果 当前市场 是 自选市场
      if (marketCurrent === 'myMarket') {
        const mySymbol = myStorage.get('mySymbol') || [];
        const marketList = {};
        if (mySymbol.length) {
          mySymbol.forEach((item) => {
            if (item && symbolAll[item]) {
              marketList[item] = symbolAll[item];
            }
          });
        }
        return marketList;
      }
      if (currentMarketList && marketCurrent) {
        return currentMarketList[marketCurrent];
      }
      return null;
    };


    workers.onmessage = (event) => {
      const { data } = event;
      const { headerSymbol } = market;
      const symbolList = getSymbolList(market.market);
      // 监听 WebSocket 链接成功
      if (data.type === 'WEBSOCKET_ON_OPEN') {
        const symbolListKey = Object.keys(symbolList);
        const objData = {};
        symbolListKey.forEach((item) => {
          objData[item] = symbolList[item];
        });
        headerSymbol.forEach((item) => {
          if (symbolListKey.indexOf(item) < 0 && symbolAll[item]) {
            objData[item] = symbolAll[item];
          }
        });
        // 发送 24小时行情历史数据 Send
        webSocketSend('Review', null, symbolCurrent, symbolAll);
        // 发送 24小时行情实时数据 Send
        webSocketSend('Market', 'sub', symbolCurrent, objData);
        // 发送 推荐位 kline数据 Send
        if (headerSymbol.length) {
          headerSymbol.forEach((item) => {
            const symbolArr = item.toLowerCase().split('/');
            const symbol = symbolArr[0] + symbolArr[1];
            workers.postMessage({
              type: 'WEBSOCKET_KLINE_SEND',
              data: {
                symbol,
                type: 'req',
                lastTimeS: '1min',
                lTime: false,
                number: 100,
                symbolCurrent: item,
              },
            });
            workers.postMessage({
              type: 'WEBSOCKET_KLINE_SEND',
              data: {
                symbol,
                type: 'sub',
                lastTimeS: '1min',
                lTime: false,
                symbolCurrent: item,
              },
            });
          });
        }
      }
      // 监听 WS 数据
      if (data.type === 'WEBSOCKET_DATA') {
        listenWSData(data.data, headerSymbol, coinList, coinTagLangs);
      }
    };
  };
  fetch('/getMarket').then(res => res.json()).then((data) => {
    setDefaultMarket(data.market);
    initWorker(data);
  });
})();
