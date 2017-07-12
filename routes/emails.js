'use strict';

var express = require('express');
var http = require("http");
var https = require("https");
var querystring = require('querystring');
var router = express.Router();

function checkReCaptcha(req) {

  return new Promise((resolve, reject) => {
    var postData = querystring.stringify({
      'secret': req.app.locals.config.recaptcha.secretkey,
      'response': req.body['g-recaptcha-response']
    });

    var options = {
      host: 'www.google.com',
      port: 443,
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    var recaptchaReq = https.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        var data = JSON.parse(chunk);
        if (data.success) {
          resolve();
        } else {
          reject();
        }
      });
    });

    recaptchaReq.on('error', (e) => {
      reject(e);
    });

    recaptchaReq.write(postData);
    recaptchaReq.end();
  });

}

router.post('/contact', function (req, res, next) {

  checkReCaptcha(req).then((response) => {
    res.mailer.send('emails/contact', {
      replyTo: req.body.email,
      to: req.app.locals.config.mailer.to, // TODO: Query DB
      subject: 'Contact form',
      form: req.body
    }, function (err) {
      if (err) {
        return next(err);
      }
      res.send('Email Sent');
    });
  }, (error) => {
    return next(error);
  });

});

module.exports = router;
