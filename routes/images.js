'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sharp = require('sharp');
var slugify = require('slug');

router.get('/:filename', function (req, res, next) {
  var resizeFunctions = req.query;
  var originalFilename = req.params.filename;
  var extension = path.extname(originalFilename);
  var filename = originalFilename.replace(extension, "");
  var resizedFilename = filename + "_" + slugify(JSON.stringify(resizeFunctions), {lower: true}) + extension;
  var uploadsDir = path.join(__dirname, '../public/uploads/');
  var resizedDir = path.join(__dirname, '../public/resized/');

  // Check if resize functions have been defined
  if (!resizeFunctions) {
    res.sendFile(path.join(uploadsDir, originalFilename));
  } else {

    // Check if file as been resized
    if (fs.existsSync(path.join(resizedDir, resizedFilename))) {
      res.sendFile(path.join(resizedDir, resizedFilename));
    } else {

      // Create resized dir if not exists
      if (!fs.existsSync(resizedDir)){
        fs.mkdirSync(resizedDir);
      }

      // Trigger sharp's functions
      var img = sharp(path.join(uploadsDir, originalFilename));
      for (var resizeFunction in resizeFunctions) {
        var parameters = resizeFunctions[resizeFunction] ? resizeFunctions[resizeFunction].split(',') : [];
        for (var i = 0; i < parameters.length; i++) {
          if (parseInt(parameters[i])) {
            parameters[i] = parseInt(parameters[i]);
          } else if (parameters[i].startsWith('{') && parameters[i].endsWith('}')) {
            parameters[i] = JSON.parse(parameters[i]);
          } else if (parameters[i].startsWith('sharp.')) {
            parameters[i] = sharp[parameters[i].substring('sharp.'.length)];
          } else if (!parameters[i] || parameters[i] == 'null' || parameters[i] == 'undefined') {
            parameters[i] = null;
          }
        }
        if (resizeFunctions.hasOwnProperty(resizeFunction)) {
          img[resizeFunction].apply(img, parameters);
        }
      }

      // Save and return file
      img.toFile(path.join(resizedDir, resizedFilename), function(err, info) {
        if (err) {
          console.log("Error when resizing image file " + originalFilename + " with resizeFunctions " + JSON.stringify(resizeFunctions));
          res.sendFile(path.join(uploadsDir, originalFilename));
        } else {
          res.sendFile(path.join(resizedDir, resizedFilename));
        }
      });

    }

  }
});

module.exports = router;
