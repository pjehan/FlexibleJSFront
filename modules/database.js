var mongodb = require('mongodb').MongoClient;

var database = {
  getPageChildren: function(req, page, callback) {
    const db = req.app.locals.db;

    db.collection('pages').find({"parent": page._id.toString()}).toArray(function (err, items) {
      for (var i = 0; i < items.length; i++) {
        if (!page.hasOwnProperty(items[i].component_id)) {
          page[items[i].component_id] = [];
        }
        page[items[i].component_id].push(items[i]);
      }
      callback(page);
    });
  },
  getPageByTemplate: function(req, template, callback) {
    const db = req.app.locals.db;
    var that = this;

    db.collection('pages').findOne({template: template, site_id: req.app.locals.site}, function (err, item) {
      that.getPageChildren(item, function(page) {
        callback(page);
      });
    });
  },
  getPageBySlug: function(req, slug, callback) {
    const db = req.app.locals.db;
    var self = this;

    db.collection('pages').findOne({slug: slug, site_id: req.app.locals.site}, function (err, item) {
      if (!item) {
        callback(null);
      } else {
        self.getPageChildren(req, item, function(page) {
          callback(page);
        });
      }
    });
  }
}

module.exports = database;
