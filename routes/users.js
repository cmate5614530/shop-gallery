var express = require('express');
var router = express.Router();
var passport = require('passport')

/* GET users listing. */
// router.use('/', notLoggedIn, (req, res, next) => {
//   next();
// });

router.get('/logout', isLoggedIn, (req, res) => {
  req.logOut();
  res.redirect('/');
});

router.post('/signup', passport.authenticate('local-signup', {
  // successRedirect: '/users/profile', ==> callback
  failureRedirect: '/signup',
  failureFlash: true
}), (req, res, next) => {
  if (req.session.oldUrl) {
    let oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/');
  }
});

router.post('/signin', passport.authenticate('local-signin', {
  // successRedirect: '/users/profile',instead this ==> callback function
  failureRedirect: '/signin',
  failureFlash: true
}), (req, res, next) => {
  if (req.session.oldUrl) {
    let oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/');
  }
});

module.exports = router;


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}