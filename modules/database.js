var mongodb = require('mongodb').MongoClient;

var database_url = 'mongodb://localhost:27017/wb';

var site = "site1";

var database = {
  getPageChildren: function(page, callback) {
    mongodb.connect(database_url, function(err, db) {
      if (err) {
        throw err;
      }
      db.collection('pages').find({"parent": page._id.toString()}).toArray(function (err, items) {
        for (var i = 0; i < items.length; i++) {
          if (!page.hasOwnProperty(items[i].component_id)) {
            page[items[i].component_id] = [];
          }
          page[items[i].component_id].push(items[i]);
        }
        callback(page);
      });
    });
  },
  getPageByTemplate: function(template, callback) {
    var that = this;
    mongodb.connect(database_url, function(err, db) {
      if (err) {
        throw err;
      }
      db.collection('pages').findOne({template: template, site_id: site}, function (err, item) {
        that.getPageChildren(item, function(page) {
          callback(page);
        });
      });
    });
  },
  getPageBySlug: function(slug, callback) {
    console.log('getPageBySlug');
    var self = this;
    mongodb.connect(database_url, function(err, db) {
      if (err) {
        throw err;
      }
      db.collection('pages').findOne({slug: slug, site_id: site}, function (err, item) {
        self.getPageChildren(item, function(page) {
          callback(page);
        });
      });
    });
  }
}

module.exports = database;
