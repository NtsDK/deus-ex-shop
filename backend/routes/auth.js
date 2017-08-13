var passport = require('passport');
var userStorage = require('../dbms').db;
var log = require('../libs/log')(module);

module.exports = function (app) {

    app.post('/login', passport.authenticate('local'), function(req, res) {
        res.redirect('page.html');
    });

    app.post('/logout', function (req, res) {
        log.info("logout" + req.user.name);
        req.logout();
        req.session.destroy();
        res.redirect('page.html');
    });
    
    app.post('/register', function (req, res, next) {
        userStorage.register(req.body.username, req.body.password, req.body.confirmPassword, function(err){
            if(err) next(err);
            res.end();
        });
    });
}