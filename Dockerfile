FROM harbor.hiotc.pro/saas-test/node:13.3.0-stretch

WORKDIR /usr/local/chainup/exchange-fe-home

ADD ./ /usr/local/chainup/exchange-fe-home

ENTRYPOINT npm run startTestHome
