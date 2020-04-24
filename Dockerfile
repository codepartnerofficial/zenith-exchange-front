FROM harbor.chaindown.com/saas-test/node:13.3.0-stretch

WORKDIR /usr/local/chainup/exchange-fe-home

ADD ./ /usr/local/chainup/exchange-fe-home

ENTRYPOINT npm run startTestHome && tail -f /root/logs/master-stdout.log
