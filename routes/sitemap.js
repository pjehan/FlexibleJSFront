'use strict';

var express = require('express');
var router = express.Router();
var sm = require('sitemap');

router.get('/sitemap.xml', function (req, res, next) {
  const db = req.app.locals.db;
  
  var sitemap = sm.createSitemap({
    hostname: req.app.locals.config.site,
    cacheTime: 600000
  });

  db.collection('pages').find().toArray((err, pages) => {
    if (err) return res.status(500).end();

    for (var i = 0; i < pages.length; i++) {
      var page = pages[i];
      if (page.fr && page.fr.seo_title) {
        sitemap.add({url: '/fr/' + page.slug});
      }
    }

    sitemap.toXML(function (err, xml) {
      if (err) return res.status(500).end();

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    });
  });

});

module.exports = router;
