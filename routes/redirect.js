'use strict';

var express = require('express');
var router = express.Router();

var urls = [];

for (var i = 0; i < urls.length; i++) {
  var url = urls[i];
  router.get(url.from, function (req, res, next) {
    res.redirect(301, url.to);
  });
}

module.exports = router;
