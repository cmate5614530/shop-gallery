var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({ 'email': email }, (err, user) => {
        let { firstName, lastName } = req.body;
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, { message: 'Email is already in use' });
        }
        let newUser = new User();
        let userID = genUserID();
        newUser.email = email;
        newUser.userID = userID;
        newUser.firstName = firstName;
        newUser.lastName = lastName;
        newUser.password = newUser.encryptPassword(password);
        newUser.save((err, result) => {
            if (err) {
                return done(err);
            }
            return done(null, result._id);
        })
    });
}));

passport.use('local-signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    console.log(email)
    User.findOne({ 'email': email }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: 'No user found.' });
        }
        if (!user.validPassword(password)) {
            return done(null, false, { message: 'Wrong password.' })
        }
        return done(null, user)
    });
}));


function genUserID() {
    var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var ID_LENGTH = 8;
    var rtn = '';
    for (var i = 0; i < ID_LENGTH; i++) {
        rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return rtn;
}