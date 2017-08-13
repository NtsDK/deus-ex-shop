var crypto = require('crypto');
var util = require('util');
var config = require('../../config');
var log = require('../../libs/log')(module);

module.exports = function(LocalDBMS, opts) {
    
    var CommonUtils = opts.CommonUtils;
    var Errors      = opts.Errors;

    var typePrecondition = function(type) {
        if (type !== 'master' && type !== 'player') {
            return [ null, 'errors-unexpected-user-type', [ type ] ];
        }
    };
    
    var registerPrecondition = function(password, confirmPassword, database) {
        if(!config.get('playerAccess:enabled')){
            return [ null, 'errors-register-operation-is-forbidden' ];
        } else if(!database.ManagementInfo.PlayersOptions.allowPlayerCreation) {
            return [ null, 'errors-register-operation-is-forbidden' ];
        } else if(password === ''){
            return [ null, 'errors-password-is-not-specified' ];
        } else if (password !== confirmPassword) {
            return [ null, 'errors-passwords-not-match'];
        }
    };

    LocalDBMS.prototype.getUser = function(username, type, callback) {
        var err = typePrecondition(type);
        if (err) {callback(new (Function.prototype.bind.apply(Errors.ValidationError, err)));return;}
        callback(null, getUserInner(this.database, username, type));
    };

    var getUserInner = function(database, username, type) {
        if(type === 'master'){
//            return database.ManagementInfo.UsersInfo[username];
            return database.Master.name === username ? database.Master : undefined;
        } else if(type === 'player'){
//            return database.ManagementInfo.PlayersInfo[username];
            return database.Shops[username];
        }
    };

    var encryptPassword = function(user, password) {
        return crypto.createHmac('sha1', user.salt).update(password).digest('hex');
    };

    LocalDBMS.prototype.setPassword = function(username, type, password, callback) {
        throw "Not supported operation: setPassword";
//        var err = typePrecondition(type);
//        if (err) {callback(new (Function.prototype.bind.apply(Errors.ValidationError, err)));return;}
//        var user = getUserInner(this.database, username, type);
//        if(user === undefined)  return callback(new Errors.ValidationError('errors-user-is-not-found')); 
//        user.salt = Math.random() + '';
//        user.hashedPassword = encryptPassword(user, password);
//        callback();
    };

    LocalDBMS.prototype.checkPassword = function(username, type, password, callback) {
        var err = typePrecondition(type);
        if (err) {callback(new (Function.prototype.bind.apply(Errors.ValidationError, err)));return;}
        var user = getUserInner(this.database, username, type);
        if(user === undefined) return callback(new Errors.ValidationError('errors-user-is-not-found')); 
//        callback(null, encryptPassword(user, password) === user.hashedPassword);
        callback(null, password === user.password);
    };
    
    var checkUser = function(username, type, password, userStorage, callback){
        userStorage.getUser(username, type, function(err, user){
            if(err) return callback(err);
            if (user !== undefined) {
//                log.info("CheckUser: " + JSON.stringify(user));
                userStorage.checkPassword(username, type, password, function(err, isValid){
                    if(err) return done(err);
                    if (isValid) {
                        user = CommonUtils.clone(user);
                        user.role = type;
                        return callback(null, user);
                    } else {
                        return callback(new Errors.ValidationError('errors-password-is-incorrect'));
                    }
                });
            } else {
                return callback();
            }
        });
    };
    
    LocalDBMS.prototype.login = function(username, password, callback) {
        var that = this;
        log.info('Login: ' + username + ':' + password);
        checkUser(username, 'master', password, that, function(err, user){
            if(err) return callback(err);
            if (user !== undefined) {
                callback(null, user)
            } else {
                if(config.get('playerAccess:enabled')){
                    checkUser(username, 'player', password, that, function(err, user){
                        if(err) return callback(err);
                        if (user !== undefined) {
                            callback(null, user)
                        } else {
                            return callback(new Errors.ValidationError('errors-user-is-not-found'));
                        }
                    });
                } else {
                    return callback(new Errors.ValidationError('errors-user-is-not-found'));
                }
            }
        });
    };
    
    LocalDBMS.prototype.register = function(userName, password, confirmPassword, callback){
        var err = registerPrecondition(password, confirmPassword, this.database);
        if (err) {callback(new (Function.prototype.bind.apply(Errors.ValidationError, err)));return;}
        this.createPlayer(userName, password, callback);
    };
    
    LocalDBMS.prototype.getShopName = function(callback, user){
        callback(null, user.name);
    };

}