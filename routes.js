
var HomeController = require('./controllers/home');
var subscriber = require('./controllers/subscriber');


module.exports.setup = function (app) {

  app.get('/', HomeController.index);

  app.post('/subscribe', subscriber.postSubscribe);

  app.get('/share', subscriber.getShare);

  app.post('/share', subscriber.postShare);

  app.get('/share/:token', subscriber.getShareToken);
};