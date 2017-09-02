var express = require('express');
var mailer = require('express-mailer');
var htmlToText = require('nodemailer-html-to-text').htmlToText;
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

var config = require('./config');

var sitemapRoutes = require('./routes/sitemap');
var redirectRoutes = require('./routes/redirect');
var imageRoutes = require('./routes/images');
var emailRoutes = require('./routes/emails');
var pageRoutes = require('./routes/index');

var app = express();

app.locals.config = config;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('port', config.app.port || process.env.PORT);
app.set('env', config.app.env || process.env.NODE_ENV);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mailer.extend(app, config.mailer);
app.use('compile', htmlToText());

app.use('/', redirectRoutes);
app.use('/', sitemapRoutes);
app.use('/_images', imageRoutes);
app.use('/_email', emailRoutes);
app.use('/', pageRoutes);

MongoClient.connect(config.db.url, function(err, db) {
  if (err) throw err;
  app.locals.db = db;
  app.listen(app.get('port'), function (err) {
    if (err) throw err;
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
