# FlexibleJSFront

## Table of contents
- [ReCaptcha](#recaptcha)

## ReCaptcha
To use Google ReCaptcha on your website, generate a new private and public key on the [Google ReCaptcha](https://www.google.com/recaptcha/admin) admin website.  
Then, copy and paste the public and private keys in the config.js file:
```
recaptcha: {
  sitekey: 'RECAPTCHA-SITEKEY',
  secretkey: 'RECAPTCHA-SECRETKEY'
}
```
Now you can use the public key in your HTML forms:
```jade
.g-recaptcha(data-sitekey='#{config.recaptcha.sitekey}')
```
And check the captcha validity in the routes/emails.js file:
```javascript
checkReCaptcha(req).then((response) => {
  res.mailer.send('emails/contact', {
    replyTo: req.body.email,
    to: req.app.locals.config.mailer.to,
    subject: 'Contact Form',
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
```
