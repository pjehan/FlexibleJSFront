var express = require('express');
var router = express.Router();

var db = require('../modules/database');

/* GET page by slug */
router.get('/:lang/:slug?', function(req, res, next) {
  var slug = req.params.slug ? req.params.slug : 'index';
  db.getPageBySlug(req, slug, function(page) {
    if (!page) {
      res.status(404).send('Page not found');
    } else {
      var template = page.template;
      var locals = { page: page, components: page[req.params.lang] };
      switch (template) {
        case 'index':

        break;
      }
      return res.render(template, locals);
    }
  });
});

module.exports = router;
