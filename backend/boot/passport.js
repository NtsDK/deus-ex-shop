var config = require("nconf");
var passport = require('passport');
var AuthLocalStrategy = require('passport-local').Strategy;

var userStorage = require('../dbms').db;
var AuthError = require('../error').AuthError;

passport.use('local', new AuthLocalStrategy(userStorage.login.bind(userStorage)));

passport.serializeUser(function (user, done) {
    done(null, JSON.stringify(user));
});

passport.deserializeUser(function (data, done) {
    try {
        done(null, JSON.parse(data));
    } catch (e) {
        done(err)
    }
});

module.exports = function (app) {
};