'use strict';

var ObjectId = require('mongodb').ObjectId;

class Page {

  constructor(page, site, lang) {
    Object.assign(this, page); // Copy database page properties to current object
    this.site = site;
    this.lang = lang;
  }

  getComponents() {
    return this[this.lang];
  }

  loadPageChildren(db, callback) {
    db.collection('pages').find({"parent": this._id.toString()}).sort({created_date: 1}).toArray((err, items) => {
      for (var i = 0; i < items.length; i++) {
        if (!this.hasOwnProperty(items[i].component_id)) {
          this[items[i].component_id] = [];
        }
        this[items[i].component_id].push(new Page(items[i], this.site, this.lang));
      }
      callback();
    });
  }

  loadPageParent(db, callback) {
    db.collection('pages').findOne({"_id": ObjectId(page.parent)}, (err, item) => {
      this.parent = new Page(item, this.site, this.lang);
      callback();
    });
  }

  loadPageRelation(db, property, callback) {
    if (this[this.lang] && this[this.lang][property]) {
      db.collection('pages').findOne({"_id": ObjectId(this[this.lang][property][0])}, (err, item) => {
        this[this.lang][property] = new Page(item, this.site, this.lang);
        callback();
      });
    } else {
      callback();
    }
  }

}

class Database {

  /**
  * Database constructor
  * @param  {MongoClient.Db} db   MongoClient database connection
  * @param  {string}         site Site
  * @param  {string}         lang Language
  */
  constructor(db, site, lang) {
    this.db = db;
    this.site = site;
    this.lang = lang;
  }

  /**
  * Get database page by slug
  * @param  {string}   slug     Page slug
  * @param  {Function} callback Callback function
  * @return {Object}            Page object
  */
  getPageBySlug(slug, callback) {
    this.db.collection('pages').findOne({slug: slug, site_id: this.site}, (err, page) => {
      if (!page) {
        callback(null);
      } else {
        callback(new Page(page, this.site, this.lang));
      }
    });
  }

  /**
  * Get database page by template
  * @param  {string}   template Page template
  * @param  {Function} callback Callback function
  * @return {Object}            Page object
  */
  getPageByTemplate(template, callback) {
    this.db.collection('pages').findOne({template: template, site_id: this.site}, (err, page) => {
      if (!page) {
        callback(null);
      } else {
        callback(new Page(page, this.site, this.lang));
      }
    });
  }

}

module.exports = Database;
