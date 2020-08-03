

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller } = app;
  if (app.config.env === 'local'){
    router.post('/fe-ex-api/*', controller.devProxy.index);
    router.post('/fe-hashrate-api/*', controller.devProxy.index);
  }
  router.get('/home/getMarket/:id', controller.getMarket.index);
  router.get('/(.+)?/', controller.homePage.index);

};
