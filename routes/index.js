'use strict';

var express = require('express');
var moment = require('moment');
var router = express.Router();
var Route = require('route-parser');
var async = require('async');

var custom = require('./custom');
var Database = require('../modules/database');

router.get('/*', function(req, res, next) {
  var generalRoute = new Route('/(:lang)(/:cat)(/:slug)');
  var routeParams = generalRoute.match('/' + req.params[0]);

  if (routeParams) {
    for (var p in routeParams) {
      req.params[p] = routeParams[p];
    }

    const db = req.app.locals.db;
    var site = req.app.locals.config.site;
    var slug = req.params.slug || req.params.cat || req.app.locals.config.homepage;
    var lang = req.params.lang || req.app.locals.config.defaultLocale;

    var database = new Database(db, site, lang);

    moment.locale(lang);
    var locals = {lang: lang, currentDomain: req.protocol + '://' + req.get('host'), currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl, moment: moment };
    var template = null;

    database.getPageBySlug(slug, function(page) {

      if (!page || typeof page[lang] === 'undefined') {
        if (req.app.get('env') === 'development') {
          return res.status(404).send('Page with slug <strong>' + slug + '</strong> and <strong>' + lang + '</strong> locale not found in <strong>' + site + '</strong> website!');
        } else {
          lang = req.app.locals.config.defaultLocale;
          template = '404';
          res.status(404);
        }
      } else {
        locals.page = page;
        locals.components = page.getComponents();
        template = page.template;
      }

      var functions = custom.loadData(locals, page, lang, database, db, template);

      async.parallel(functions, function(err, results) {
        return res.render(template, locals);
      });

    });

  } else {
    res.status(404).send('Route');
  }
});

module.exports = router;
