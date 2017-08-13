/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
   limitations under the License. */

"use strict";

var config = require('../config');
var pathTool = require('path');
var path = pathTool.join(config.get('frontendPath'), 'js/common/')

var Migrator = require(path + 'migrator');
var Logger = require(path + 'logger');
var R = require('ramda');
var Constants = require(path + 'constants');

var Errors = require(path + 'errors');
var CommonUtils = {}; 
require(path + 'commonUtils')(CommonUtils, R);
var ProjectUtils = {}; 
require(path + 'projectUtils')(ProjectUtils, R, Constants, Errors, CommonUtils);
var Precondition = {}; 
require(path + 'precondition')(Precondition, R, Errors);
//require(path + 'commonUtils')(CommonUtils, R, Constants, Errors);
var Schema = {}; 
require(path + 'schema')(Schema, R, CommonUtils, Constants);
var dateFormat = require(path + 'dateFormat');
var EventEmitter = require(path + 'EventEmitter');
var Ajv = require('ajv');
var log = require('../libs/log')(module);

var projectName = config.get('inits:projectName');
var projectAPIs = require('./' + projectName);

var opts = {
    Migrator     : Migrator    ,
    CommonUtils  : CommonUtils ,
    ProjectUtils : ProjectUtils,
    Precondition : Precondition,
    EventEmitter : EventEmitter,
    
    R            : R           ,
    Ajv          : Ajv         ,
    Schema       : Schema      ,
    
    Errors       : Errors      ,
    listeners    : {}          ,
    Constants    : Constants   ,
    
    dbmsUtils    : {}          ,
    dateFormat   : dateFormat  ,
    custom       : {}          ,
};

function LocalDBMS(){
    this._init(opts.listeners);
};

var funcList = {};
var func = R.curry(function(path, name) {
    var before = R.keys(LocalDBMS.prototype);
    require(path + name)(LocalDBMS, opts);
    var after = R.keys(LocalDBMS.prototype);
    var diff = R.difference(after, before);
    log.info(name + ' ' + diff);
    funcList[name] = R.zipObj(diff, R.repeat(true, diff.length));
});

var commonFunc = func(path + 'engine/');
var serverFunc = func('./' + projectName + '/');

projectAPIs.initAPIs(commonFunc, serverFunc);

if(config.get('logOverrides:enabled')){
    Logger.apiInfo = R.merge(Logger.apiInfo, config.get('logOverrides:overrides'));
}

var baseAPIList = R.keys(R.mergeAll(R.values(funcList)));
var loggerAPIList = R.keys(R.mergeAll(R.values(Logger.apiInfo)));
var permissionAPIList = opts.custom.permissionAPIList;

var loggerDiff = R.symmetricDifference(loggerAPIList, baseAPIList);
var permissionDiff = R.symmetricDifference(permissionAPIList, baseAPIList);
if(loggerDiff.length > 0 || permissionDiff.length > 0){
    console.error('Logger diff: ' + loggerDiff);
    console.error('Logged but not in base: ' + R.difference(loggerAPIList, baseAPIList));
    console.error('In base but not logged: ' + R.difference(baseAPIList, loggerAPIList));
    console.error('Permission diff: ' + permissionDiff);
    throw new Error('API processors are inconsistent');
};

Logger.attachLogCalls(LocalDBMS, R, true);

//var baseExample = require(path + 'baseExample');
var emptyBase = require(path + 'emptyBase');

var loader = require('../autosave/databaseLoader');

var lastDb = loader.loadLastDatabase();

var db = new LocalDBMS();
if(lastDb){
    projectAPIs.populateDatabase(lastDb);
    db.setDatabase(lastDb, function(){});
} else {
    projectAPIs.populateDatabase(emptyBase.data);
    db.setDatabase(emptyBase.data, function(){});
}

db.getConsistencyCheckResult(function(err, consistencyErrors){
    if(err) {log.error(err); return;}
    
    var consoleLog = (str) => console.error(str);
    consistencyErrors.forEach(consoleLog);
    if(consistencyErrors.length > 0){
        log.info('overview-consistency-problem-detected');
    } else {
        log.info('Consistency check didn\'t find errors');
    }
});

exports.db = db;