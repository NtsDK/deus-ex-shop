var PermissionError = require('../../error').PermissionError;
var config = require('../../config');
var https = require('https');
var HttpError = require('../../error').HttpError;

var log = require('../../libs/log')(module);

var config = require('./apiConfig');

module.exports = function(LocalDBMS, opts) {
    
    var R             = opts.R;
    var CU            = opts.CommonUtils;
    var PC            = opts.Precondition;
    var Errors        = opts.Errors;
    var Constants     = opts.Constants;
    var apiOptions    = config.apiOptions;
    
    var containerPath = ['Shops'];
    
    var commonOpts = apiOptions.commonOpts;
    var getShopDataOpts         = R.mergeDeepRight(R.clone(commonOpts), apiOptions.getShopDataOpts);
    var implantOpts             = R.mergeDeepRight(R.clone(commonOpts), apiOptions.implantOpts);
    var transferOpts            = R.mergeDeepRight(R.clone(commonOpts), apiOptions.transferOpts);
    var postEventOpts           = R.mergeDeepRight(R.clone(commonOpts), apiOptions.postEventOpts);
    var postPillsOpts           = R.mergeDeepRight(R.clone(commonOpts), apiOptions.postPillsOpts);
    var assetsApiCheckOpts      = R.mergeDeepRight(R.clone(commonOpts), apiOptions.assetsApiCheckOpts);
    var getFullImplantDataOpts  = R.mergeDeepRight(R.clone(assetsApiCheckOpts), apiOptions.getFullImplantDataOpts);
    var getFullPillsDataOpts    = R.mergeDeepRight(R.clone(assetsApiCheckOpts), apiOptions.getFullPillsDataOpts);
    var getCurPillsDataOpts     = R.mergeDeepRight(R.clone(assetsApiCheckOpts), apiOptions.getCurPillsDataOpts);
    
    LocalDBMS.prototype.importPills = function(callback) {
        callback(new Error('External API is not available'));
        getFullImplantDataOpts.auth = config.pillsBaseCredentials.login + ':' + config.pillsBaseCredentials.password;
//        makeReq(assetsApiCheckOpts, onOk);
        var database = this.database;
        
        var onOk = (res, info) => {
//            log.info('onOk');
            try {
//                log.info(info);
                info = JSON.parse(info);
                var pillsAssets = R.indexBy(R.prop('name'), info.rows.map(el => {
                    return {
                        "name": el.doc._id,
                        "displayString": el.doc.displayName || '',
                        "isPhysical": true,
                        "resourceCost": 0,
                        "apiKey": el.doc._id,
                        "description": el.doc.description || '' 
//                            'Система: ' + el.doc['system'] + '\n' +  el.doc.details
                    };
                }));
                R.intersection(R.keys(pillsAssets),R.keys(database.Assets)).forEach( name => {
                    pillsAssets[name].resourceCost = database.Assets[name].resourceCost;
//                    pillsAssets[name].description = database.Assets[name].description;
                });
                database.Assets = R.mergeDeepRight(database.Assets, pillsAssets);
            } catch(err){
                callback(err);
                return;
            }
            
            callback();
        };
        
        makeReq(getFullPillsDataOpts, onOk, callback);
    };
    
    var validateQRs = function(qrs, callback) {
        getCurPillsDataOpts.auth = config.curPillsBaseCredentials.login + ':' + config.curPillsBaseCredentials.password;
        
        var onOk = (res, info) => {
//            log.info('onOk');
            try {
//                log.info(info);
                info = JSON.parse(info);
                var ids = info.rows.map(R.prop('id'));
                var intersection = R.intersection(qrs, ids);
                if(intersection.length > 0){
                    callback('Some of QRs already used: ' + JSON.stringify(intersection));
                } else {
                    callback();
                }
            } catch(err){
                callback(err);
                return;
            }
        };
        
        makeReq(getCurPillsDataOpts, onOk, callback);
    };
    
    LocalDBMS.prototype.importImplants = function(callback) {
        callback(new Error('External API is not available'));
        getFullImplantDataOpts.auth = config.implantsBaseCredentials.login + ':' + config.implantsBaseCredentials.password;
//        makeReq(assetsApiCheckOpts, onOk);
        var database = this.database;
        
        var onOk = (res, info) => {
            try {
//                log.info(info);
                info = JSON.parse(info);
                var implantAssets = R.indexBy(R.prop('name'), info.rows.map(el => {
                    return {
                      "name": el.doc._id,
                      "displayString": el.doc.displayName,
                      "isPhysical": false,
                      "resourceCost": 0,
                      "apiKey": el.doc._id,
                      "description": 'Система: ' + el.doc['system'] + '\n' +  el.doc.details
                    };
                }));
                R.intersection(R.keys(implantAssets),R.keys(database.Assets)).forEach( name => {
                    implantAssets[name].resourceCost = database.Assets[name].resourceCost;
                });
                database.Assets = R.mergeDeepRight(database.Assets, implantAssets);
            } catch(err){
                callback(err);
                return;
            }
            
            callback();
        };
        
        makeReq(getFullImplantDataOpts, onOk, callback);
    };
    LocalDBMS.prototype.getImplantsAPICheck = function(callback) {
        callback(new Error('External API is not available'));
        var index = 0;
        var arr = [];
        var assets = R.clone(this.database.Assets);
//        var assets = R.values(assets).filter(asset => !asset.isPhysical && asset.resourceCost > 0);
        var assets = R.values(assets).filter(asset => !asset.isPhysical && asset.apiKey !== '');
        
        assetsApiCheckOpts.auth = config.implantsBaseCredentials.login + ':' + config.implantsBaseCredentials.password;
        
        var onOk = (res, info) => {
            try {
                info = JSON.parse(info);
            } catch(err){
                callback(err);
                return;
            }
            var implants = R.indexBy(R.prop('id'), info.rows);
            callback(null, assets.map( asset => {
                return {
                    name: asset.name,
                    statusCode: implants[asset.apiKey] ? 200 : 404,
                    headers: '',
                    data: ''
                };
            }));
        };
        makeReq(assetsApiCheckOpts, onOk, callback);
    };
    LocalDBMS.prototype.getPillsAPICheck = function(callback) {
        callback(new Error('External API is not available'));
        var assets = R.clone(this.database.Assets);
//        var assets = R.values(assets).filter(asset => !asset.isPhysical && asset.resourceCost > 0);
        var assets = R.values(assets).filter(asset => asset.isPhysical && asset.apiKey !== '');
        
        assetsApiCheckOpts.auth = config.pillsBaseCredentials.login + ':' + config.pillsBaseCredentials.password;
        
        var onOk = (res, info) => {
            try {
                info = JSON.parse(info);
            } catch(err){
                callback(err);
                return;
            }
            var implants = R.indexBy(R.prop('id'), info.rows);
            callback(null, assets.map( asset => {
                return {
                    name: asset.name,
                    statusCode: implants[asset.apiKey] ? 200 : 404,
                            headers: '',
                            data: ''
                };
            }));
        };
        makeReq(getFullPillsDataOpts, onOk, callback);
    };
    
    var makeReq = (opts, onOk, callback) => {
        log.info('Request opts: ' + JSON.stringify(opts));
        var req = https.request(opts, function(res) {
            var type = res.statusCode === 200 ? 'info' : 'error';
            log[type]('Request result headers: opts ' + JSON.stringify(opts) + ', STATUS: '  + res.statusCode + ', HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            if(res.statusCode === 200){
                var info = '';
                res.on('data', function(chunk) {
                    info += chunk;
                });
                res.on('end', () => {
                    log.info('Request result data: opts ' + JSON.stringify(opts) + ', recieved data: '  + info);
                    onOk(res, info);
                });
            } else {
                var info = '';
                res.on('data', function(chunk) {
                    info += chunk;
                });
                res.on('end', () => {
                    log.error('Request result data: opts ' + JSON.stringify(opts) + ', recieved data: '  + info);
                    onRemoteErrorDelegate(callback, res, info);
                });
            }
        });

        req.on('error', function(err) {
            log.error('Problem with request: ' + JSON.stringify(opts) + ', message: '  + err.message || err);
            callback(err);
        });
        
        req.end();
    };
    
    LocalDBMS.prototype.getShopsAPICheck = function(callback) {
        callback(new Error('External API is not available'));
        var index = 0;
        var arr = [];
        var shops = R.clone(this.database.Shops);
        var shopNames = R.keys(shops);
        
        var checkShop = function(){
            if(index < shopNames.length){
                var shop = shops[shopNames[index]];
                index++;
//                log.info('index: ' + index + ', name: ' + shopNames[index]);
                makeShopCall(shop.sellerLogin, shop.sellerPassword, (res, chunk) => {
                    arr.push({
                        name: shop.name,
                        statusCode: res.statusCode,
                        headers: JSON.stringify(res.headers),
                        data: chunk
                    });
                    checkShop();
                }, (res) => {
                    arr.push({
                        name: shop.name,
                        statusCode: res.statusCode,
                        headers: JSON.stringify(res.headers)
                    });
                    checkShop();
                }, (err)=>{
                    arr.push({
                        name: shop.name,
                        status: 'FAIL',
                        data: err
                    });
                    checkShop();
                });
            } else {
                callback(null, arr);
            }
        };
        checkShop();
    };
    
    LocalDBMS.prototype.getShopAPICheck = function(shopName, callback) {
        callback(new Error('External API is not available'));
        var container = R.path(containerPath, this.database);
        PC.precondition(PC.entityExistsCheck(shopName, R.keys(container)), callback, () => {
            var shop = container[shopName];
            makeShopCall(shop.sellerLogin, shop.sellerPassword, (res, chunk) => {
                callback(null, {
                    shopName: shop.name,
                    statusCode: res.statusCode,
                    headers: JSON.stringify(res.headers),
                    data: chunk
                });
            }, (res) => {
                callback(null, {
                    shopName: shop.name,
                    statusCode: res.statusCode,
                    headers: JSON.stringify(res.headers)
                });
            }, (err) => callback({
                shopName: shop.name,
                status: 'FAIL',
                data: err
            }));
        });
    };
    
    LocalDBMS.prototype.getShopIndex = function(shopName, callback) {
        callback(new Error('External API is not available'));
        var container = R.path(containerPath, this.database);
        PC.precondition(PC.entityExistsCheck(shopName, R.keys(container)), callback, () => {
            var shop = container[shopName];
            makeShopCall(shop.sellerLogin, shop.sellerPassword, (res, chunk) => {
                callback(null, String(JSON.parse(chunk).Index));
            }, () => {
                callback(null, 'N/A');
            }, (err) => callback(err));
        });
    };
    
    var makeShopCall = function(shopLogin, shopPassword, onOk, onRemoteError, onError){
        var opts = R.clone(getShopDataOpts);
        opts.auth = shopLogin + ':' + shopPassword;
        opts.path = opts.path + shopLogin;
        var req = https.request(opts, function(res) {
            var type = res.statusCode === 200 ? 'info' : 'error';
            log[type]('makeShopCall request result headers: opts ' + JSON.stringify(opts) + ', STATUS: '  + res.statusCode + ', HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            if(res.statusCode === 200){
                res.on('data', function(chunk) {
                    log.info('makeShopCall request result data: opts ' + JSON.stringify(opts) + ', recieved data: '  + chunk);
                    onOk(res, chunk);
                });
            } else {
                onRemoteError(res);
            }
        });

        req.on('error', function(err) {
            log.error('Problem with makeShopCall request: ' + JSON.stringify(opts) + ', message: '  + err.message || err);
            onError(err);
        });

        req.end();
    };
    
    var state={};
    var queueInitialized = false;
    var uniqueId = 1;
    
    var initializeQueue = (database) => {
        if(queueInitialized === false){
            if(database.Misc.queueInProgress != undefined) {
                database.Misc.queue = R.values(database.Misc.queueInProgress);
            } else {
                database.Misc.queue = [];
            }
            queueInitialized = true;
            database.Misc.queueInProgress = {};
            state.queuePush = function(arr){database.Misc.queue.push(arr)};
            setInterval(() => {
                if(database.Misc.queue.length != 0){
                    log.info('queue.length: ' + database.Misc.queue.length);
                }
                while(database.Misc.queue.length > 0){
                    var el = database.Misc.queue.pop();
                    var newId = uniqueId;
                    database.Misc.queueInProgress[newId] = el;
                    uniqueId++;
                    log.info('trying resend implant message: ' + JSON.stringify(el.opts))
                    var innerCallback = () => delete database.Misc.queueInProgress[newId]; 
                    sendImplantMessage.call(null, el, innerCallback,innerCallback,innerCallback);
                }
            }, 1000);
        }
    }
    
    LocalDBMS.prototype.buyAsset = function(shopName, assetName, assetType, cost, customerLogin, customerPassword, opts, callback) {
        callback(new Error('External API is not available'));
        initializeQueue(this.database);
        var container = R.path(containerPath, this.database);
        var chain = [PC.entityExistsCheck(shopName, R.keys(container)), PC.isString(assetName), 
                     PC.isString(assetType), PC.elementFromEnum(assetType, Constants.assetTypes), 
                     PC.isNumber(cost), PC.isNonNegative(cost), 
                     PC.isString(customerLogin), PC.isString(customerPassword),
                     PC.isObject(opts),
                     PC.isNumber(opts.amount), PC.isInRange(opts.amount,1,10)];
        PC.precondition(PC.chainCheck(chain), callback, () => {
            var shop = container[shopName];
            var assetContainer = container[shopName][assetType === 'local' ? 'localAssets' : 'assets'];
            customerLogin = customerLogin.toLowerCase();
            var chain = [PC.entityExistsCheck(assetName, R.keys(assetContainer))];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                if(assetType === 'global'){
                    var asset = this.database.Assets[assetName];
                    if(asset.apiKey !== '' && !asset.isPhysical){
                        makeImplantRequest(shop, customerLogin, customerPassword, asset, cost, assetName, callback);
                    } else if(asset.apiKey !== '' && asset.isPhysical){
                        chain = [PC.isArray(opts.codes)];
                        PC.precondition(PC.chainCheck(chain), callback, () => {
                            chain = [PC.equals(opts.codes.length, opts.amount), 
                                     PC.arrayCheck(opts.codes, PC.isString), 
                                     PC.equals(opts.codes.length, R.uniq(opts.codes).length), 
                                     PC.arrayCheck(opts.codes, PC.patternCheck(R.__, /^\d\d\d\d\d\d$/))];
                            PC.precondition(PC.chainCheck(chain), callback, () => {
                                makePillsRequest(shop, customerLogin, customerPassword, asset, cost, assetName, opts, callback);
                            });
                        });
                    } else {
                        makeTransferRequest(shop, customerLogin, customerPassword, cost, assetName, callback);
                    }
                } else { // local assets
                    makeTransferRequest(shop, customerLogin, customerPassword, cost, assetName, callback);
                }
            });
        });
    };
    
    var getUnixTimestamp = () => Math.round(new Date().getTime() );
    
    var makePillsRequest = (shop, customerLogin, customerPassword, asset, cost, assetName, opts, callback) => {
        validateQRs(opts.codes, (err) => {
            if(err) {callback(new HttpError(400, err));}
            
            var data = {
                "Seller": shop.sellerLogin,
                "Receiver": customerLogin,
                "ReceiverPass": customerPassword,
                "Price": cost,
                "Index": asset.resourceCost*opts.amount,
                "Description": JSON.stringify({
                    assetName: assetName,
                    shopName:shop.name,
                    amount: opts.amount
                })
            }
            
            var opts2 = R.clone(implantOpts);
            opts2.auth = shop.sellerLogin + ':' + shop.sellerPassword;
            
            var pillInfo = {};
            pillInfo.opts = R.clone(postPillsOpts);
            pillInfo.opts.auth = config.curPillsBaseCredentials.login + ':' + config.curPillsBaseCredentials.password;
            
            pillInfo.data = {docs:opts.codes.map(code => {
                return {
                    _id: '9c5d9d84-dbf2-46f3-93f3-000000' + code,
                    pillId : asset.apiKey,
                    timestamp: getUnixTimestamp(),  
                    shopName: shop.name
                }
            })};
            
            buyAssetRequestCall(opts2, data, 'pill', pillInfo, callback);
        });
        
    };
    
    var makeImplantRequest = (shop, customerLogin, customerPassword, asset, cost, assetName, callback) => {
        
        var data = {
            "Seller": shop.sellerLogin,
            "Receiver": customerLogin,
            "ReceiverPass": customerPassword,
            "Price": cost,
            "Index": asset.resourceCost,
            "Description": JSON.stringify({
                 assetName: assetName,
                 shopName:shop.name
            })
        }
        
        var opts = R.clone(implantOpts);
        opts.auth = shop.sellerLogin + ':' + shop.sellerPassword;
        
        var implantInfo = {};
        implantInfo.opts = R.clone(postEventOpts);
        implantInfo.opts.auth = customerLogin + ':' + customerPassword;
        implantInfo.opts.path +=  customerLogin;
        
        implantInfo.data = {events:[{
            eventType: "add-implant", 
            timestamp: getUnixTimestamp(),  
            data: {
                id: asset.apiKey
            }
        }]};
        
        buyAssetRequestCall(opts, data, 'implant', implantInfo, callback);
    };
    
    var makeTransferRequest = (shop, customerLogin, customerPassword, cost, assetName, callback) => {
        
        var data = {
            "Sender": customerLogin,
            "Receiver": shop.sellerLogin,
            "Amount": cost,
            "Description": JSON.stringify({
                assetName: assetName,
                shopName:shop.name
            })
        };
        
        var opts = R.clone(transferOpts);
        opts.auth = customerLogin + ':' + customerPassword;
        buyAssetRequestCall(opts, data, null, null, callback);
    };
    
    var buyAssetRequestCall = (opts, data, type, extraInfo, callback) => {
        buyAssetRequest(opts, data, (res, chunk) => {
            if(type === 'implant'){
                sendImplantMessage(extraInfo, () => callback(), onRemoteErrorDelegate(callback), (err) => callback(err));
            } else if(type === 'pill'){
                sendImplantMessage(extraInfo, () => callback(), onRemoteErrorDelegate(callback), (err) => callback(err));
            } else {
                callback();
            }
        }, onRemoteErrorDelegate(callback), (err) => callback(err));
    };
    
    var onRemoteErrorDelegate = R.curry((callback, res, info) => {
//        log.info(JSON.stringify(res.headers));
//        log.info(info);
        if(info !== ''){
            try{
                info = JSON.parse(info);
            } catch (err2){
                callback(new HttpError(res.statusCode, info));
                return;
            }
            
            callback(new HttpError(res.statusCode, info.Message));
        } else {
            callback(new HttpError(res.statusCode));
        }
    });
    
    var sendImplantMessage = (implantInfo, onOk, onRemoteError, onError) => {
        log.info('sendImplantMessage request opts: ' + JSON.stringify(implantInfo));
        var req = https.request(implantInfo.opts, function(res) {
            var type = res.statusCode === 200  || res.statusCode === 201 || res.statusCode === 202 ? 'info' : 'error';
            log[type]('sendImplantMessage request result headers: opts ' + JSON.stringify(implantInfo) + ', STATUS: '  + res.statusCode + ', HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            if(res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 202){
                var info = '';
                res.on('data', function(chunk) {
                    info += chunk;
                });
                res.on('end', () => {
                    log.info('sendImplantMessage request result data: opts ' + JSON.stringify(implantInfo) + ', recieved data: '  + info);
                    onOk(res, info);
//                    onRemoteError(res, info);
                });
            } else if(res.statusCode === 429) {
                
                var info = '';
                res.on('data', function(chunk) {
                    info += chunk;
                });
                res.on('end', () => {
                    onOk(res, info);
                    log.info('sendImplantMessage request result data: opts ' + JSON.stringify(implantInfo) + ', recieved data: '  + info);
                    log.info('Push ImplantMessage to resend queue: ' + JSON.stringify(implantInfo));
                    state.queuePush(implantInfo);
                });
                
            } else {
                var info = '';
                res.on('data', function(chunk) {
                    info += chunk;
                });
                res.on('end', () => {
                    log.error('sendImplantMessage request result data: opts ' + JSON.stringify(implantInfo) + ', recieved data: '  + info);
                    onRemoteError(res, info);
                });
            }
        });

        req.on('error', function(err) {
            state.queuePush(implantInfo);
            log.error('Problem with request: ' + JSON.stringify(implantInfo) + ', message: '  + err.message || err);
            log.info('Push ImplantMessage to resend queue: ' + JSON.stringify(implantInfo));
            onError(new Errors.ValidationError('errors-unexpected-buy-implant-error', [err]));
        });
        
        req.write(JSON.stringify(implantInfo.data));

        req.end();
    };
    
    var buyAssetRequest = (opts, data, onOk, onRemoteError, onError) => {
        log.info('buyAssetRequest opts: ' + JSON.stringify(opts) + ', data: ' + JSON.stringify(data));
        var req = https.request(opts, function(res) {
            var type = res.statusCode === 200 ? 'info' : 'error';
            log[type]('buyAssetRequest result headers: opts ' + JSON.stringify(opts) + ', STATUS: '  + res.statusCode + ', HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            if(res.statusCode === 200){
                res.on('data', function(chunk) {
                    log.info('buyAssetRequest result data: opts ' + JSON.stringify(opts) + ', recieved data: '  + chunk);
                    onOk(res, chunk);
                });
            } else {
                var info = '';
                res.on('data', function(chunk) {
                    info += chunk;
                });
                res.on('end', () => {
                    log.error('buyAssetRequest result data: opts ' + JSON.stringify(opts) + ', recieved data: '  + info);
                    onRemoteError(res, info);
                });
            }
        });

        req.on('error', function(err) {
            log.error('Problem with buyAssetRequest: ' + JSON.stringify(opts) + ', message: '  + err.message || err);
            onError(err);
        });
        
        req.write(JSON.stringify(data));

        req.end();
    };
    
    LocalDBMS.prototype.getTheme = function(callback, user) {
        if(user.role === 'master'){
            callback(null, this.database.Misc.masterTheme || '');
        } else {
            callback(null, this.database.Misc.Themes[user.name] || '');
        }
    };
    
    LocalDBMS.prototype.setTheme = function(theme, callback, user) {
        var chain = [ PC.isString(theme), PC.elementFromEnum(theme, Constants.themeList)];
        PC.precondition(PC.chainCheck(chain), callback, () => {
            if(user.role === 'master'){
                this.database.Misc.masterTheme = theme;
            } else {
                this.database.Misc.Themes[user.name] = theme;
            }
            callback();
        });
    };
    
};
