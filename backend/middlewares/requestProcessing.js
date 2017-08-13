var url = require('url');
var HttpError = require('../error').HttpError;
var db = require("../dbms").db;
var log = require('../libs/log')(module);

function stringify(jsonObj){
    return JSON.stringify(jsonObj, null, '  ');
}

function setHeader(res){
    res.set('Content-Type', 'application/json; charset=utf-8');
};

function startsWith(str1, str2){
    return str1.substring(0, str2.length) === str2;
};

function onGet(req, res, next){
    var urlParsed = url.parse(req.url, true);
    var command = urlParsed.pathname.substring(1);
    var params, result;
    if(db[command]){
        params = urlParsed.query.params ? JSON.parse(urlParsed.query.params) : [];
        log.info('Command: ' + command + ', params: ' + params);
        params.push(function(err, result){
            if (err) {
                return next(err);
            }
            setHeader(res);
            res.end(stringify(result));
        });
        params.push(req.user);
        var err = db.hasPermission(command, params, req.user);
        if(err) return next(err);
        db[command].apply(db, params);
        return;
    }
    next();
};

function onPut(req, res, next){
    var urlParsed = url.parse(req.url, true);
    var command = urlParsed.pathname;
    var params = req.body;
    log.info('Command: ' + command + ', params: ' + params);
    command = command.substring(1);
    if(db[command]){
        params.push(function(err){
            if (err) {
                return next(err);
            }
            setHeader(res);
            res.end();
        });
        params.push(req.user);
        var err = db.hasPermission(command, params, req.user);
        if(err) return next(err);
        db[command].apply(db, params);
        return;
    }
    next();
};

module.exports = function(req, res, next) {
    
    var urlParsed = url.parse(req.url, true);
    var command = urlParsed.pathname.substring(1);
    log.info('Method: ' + req.method + ', command: ' + command);
    if(command === "subscribeOnPermissionsUpdate" || command === "getPermissionsSummary"){
        db[command](req, res, next);
        return;
    }
    
    switch(req.method){
    case 'GET':
        onGet(req, res, next);
        break;
    case 'PUT':
        onPut(req, res, next);
        break;
    default: 
        next();
    }
};
