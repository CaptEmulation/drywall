'use strict';

//dependencies
var config = require('./config'),
    express = require('express'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    helmet = require('helmet');

//create express app
var app = express();

//keep reference to config
app.config = config;

//setup the web server
app.server = http.createServer(app);

//setup mongoose
var db = app.db = mongoose.createConnection(config.mongodb.uri, {server:{auto_reconnect:true}});

db.on('error', console.error.bind(console, 'mongoose connection error: '));
db.once('open', function () {
  //and... we have a data store

  //listen up
  app.server.listen(app.config.port, function(){
    //and... we're live
  });

  require('./stratum/controller').start(app).then(function () {
    console.log('Stratum controller is a go.');
  });
});

db.on('connecting', function() {
 console.log('connecting to MongoDB...');
});

db.on('error', function(error) {
 mongoose.disconnect();
});
db.on('connected', function() {
 console.log('MongoDB connected!');
});
db.once('open', function() {
 console.log('MongoDB connection opened!');
});
db.on('reconnected', function () {
 console.log('MongoDB reconnected!');
});
db.on('disconnected', function() {
 console.log('MongoDB disconnected!');
 mongoose.connect(config.mongodb.uri, {server:{auto_reconnect:true}});
});

//config data models
require('./models')(app, mongoose);

//settings
app.disable('x-powered-by');
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middleware
app.use(require('morgan')('dev'));
app.use(require('compression')());
app.use(require('serve-static')(path.join(__dirname, 'public')));
app.use(require('body-parser')());
app.use(require('method-override')());
app.use(require('cookie-parser')());
app.use(session({
  secret: config.cryptoKey,
  store: new mongoStore({ url: config.mongodb.uri })
}));
app.use(passport.initialize());
app.use(passport.session());
helmet.defaults(app);

//response locals
app.use(function(req, res, next) {
  res.locals.user = {};
  res.locals.user.defaultReturnUrl = req.user && req.user.defaultReturnUrl();
  res.locals.user.username = req.user && req.user.username;
  next();
});

//global locals
app.locals.projectName = app.config.projectName;
app.locals.copyrightYear = new Date().getFullYear();
app.locals.copyrightName = app.config.companyName;
app.locals.cacheBreaker = 'br34k-01';

//setup passport
require('./passport')(app, passport);

//setup routes
require('./routes')(app, passport);

//custom (friendly) error handler
app.use(require('./views/http/index').http500);

//setup utilities
app.utility = {};
app.utility.sendmail = require('./util/sendmail');
app.utility.slugify = require('./util/slugify');
app.utility.workflow = require('./util/workflow');

// Drastic error reporting
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err + "\n" + err.stack);
});
