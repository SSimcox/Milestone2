/**
 * Created by Steven on 12/8/2016.
 */

var express = require('express');
var route = express.Router();
var db = require('../database/queries');
var config = require('./config');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
        clientID: config.clientId,
        clientSecret: config.clientSecret,
        callbackURL: "http://s-simcox.duckdns.org/auth/google/callback"
    },
    function(token, tokenSecret, profile, done) {
        db.findOrCreate(profile, function (err, user) {
            return done(err, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    //console.log("serialize: "+ JSON.stringify(user));
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    console.log("deserialize: "+ user);
    done(null, user);
});

route.use(passport.initialize());
route.use(passport.session({pauseStream : true}));

route.get('/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login','email'] }));

route.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
        req.logIn(req.user,function(err){
            if(err) {
                console.log("error with login: "+err);
                return res.redirect('/');
            }
            //console.log("No error with user login");
            return res.redirect('/game');
        });

    });

route.post('/',function(req,res){
    req.logout();
    return res.redirect('/');
})




module.exports = route;