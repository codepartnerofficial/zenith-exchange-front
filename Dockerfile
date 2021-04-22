FROM harbor.hiotc.pro/saas-test/node:14.16.1

WORKDIR /usr/local/chainup/exchange-fe-home

ADD ./ /usr/local/chainup/exchange-fe-home

ENTRYPOINT npm run startTestHome
