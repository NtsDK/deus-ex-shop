var log = require('../../libs/log')(module);

module.exports = function(LocalDBMS, opts) {
    
    var Errors        = opts.Errors      ;
    var R             = opts.R           ;
    var PC            = opts.Precondition;
    var dbmsUtils     = opts.dbmsUtils   ;
    
    var or = function(check1, check2){
        return function(db, command, args, user){
            var err1 = check1(db, command, args, user);
            if(err1 === null){ return null; }
            var err2 = check2(db, command, args, user);
            if(err2 === null){ return null; }
            return err1;
        };
    };
    
    var editorFilter = function(check){
        return function(db, command, args, user){
            if(db.ManagementInfo.editor !== null){
                return db.ManagementInfo.editor === user.name ? null : ['errors-other-user-is-editor', [db.ManagementInfo.editor]];
            } else {
                return check(db, command, args, user);
            }
        }
    };
    
    var open = () => null;
    var forbidden = () => ['errors-forbidden'];
    var unknownCommand = (command) => ['errors-unknown-command', [command]];
    var userIsLogged   = (db, command, args, user) => user ? null : ['errors-user-is-not-logged'];
    var roleIsMaster   = (db, command, args, user) => user.role === 'master' ? null : ['errors-forbidden-for-role', [command, user.role]];
    var roleIsPlayer = (db, command, args, user) => user.role === 'player' ? null : ['errors-forbidden-for-role', [command, user.role]];
    var isShopEditor = (db, command, args, user) => {
        if(user.role === 'master'){
            return null;
        } else {
            return args[0] === user.name ? null : ['errors-player-is-not-a-shop-owner', [user.name, args[0]]];
        }
    };
    
    
    var roleIsMasterCheck        = (db, command, args, user) => userIsLogged(db, command, args, user) || roleIsMaster(db, command, args, user);
    var isShopEditorCheck        = (db, command, args, user) => userIsLogged(db, command, args, user) || isShopEditor(db, command, args, user);
    
    var apiInfo = {
        "baseAPI" : {
            "_init" : forbidden,
            "getDatabase" : roleIsMasterCheck,
            "setDatabase" : roleIsMasterCheck,
            "getMetaInfo" : forbidden,
            "setMetaInfo" : forbidden
        },
        "consistencyCheckAPI" : {
            "getConsistencyCheckResult" : roleIsMasterCheck
        },
        "entityAPI" : {
            "getEntityNamesArray" : roleIsMasterCheck
        },
        "shopAPI" : {
            "getShopNamesArray" : roleIsMasterCheck,
            "getShopAssets" : roleIsMasterCheck,
            "getShopPasswords" : roleIsMasterCheck,
            "addAssetToShop" : roleIsMasterCheck,
            
            "removeAssetFromShop" : roleIsMasterCheck,
            "setShopData" : roleIsMasterCheck,
            "getShop" : isShopEditorCheck,
            "createShop" : roleIsMasterCheck,
            
            "changeShopPassword" : roleIsMasterCheck,
            "removeShop" : roleIsMasterCheck,
            "createCategory" : isShopEditorCheck,
            "renameCategory" : isShopEditorCheck,
            
            "removeCategory" : isShopEditorCheck,
            "getLocalAsset" : isShopEditorCheck,
            "createLocalAsset" : isShopEditorCheck,
            "renameLocalAsset" : isShopEditorCheck,
            
            "removeLocalAsset" : isShopEditorCheck,
            "updateLocalAssetField" : isShopEditorCheck,
            "setAssetCost" : isShopEditorCheck,
            "addGlobalAssetToCategory" : isShopEditorCheck,
            
            "addLocalAssetToCategory" : isShopEditorCheck,
            "removeGlobalAssetFromCategory" : isShopEditorCheck,
            "removeLocalAssetFromCategory" : isShopEditorCheck,
        },
        "externalAPI" : {
            "getShopAPICheck" : roleIsMasterCheck,
            "getShopsAPICheck" : roleIsMasterCheck,
            "getImplantsAPICheck" : roleIsMasterCheck,
            "getPillsAPICheck" : roleIsMasterCheck,
            "importImplants" : roleIsMasterCheck,
            "importPills" : roleIsMasterCheck,
            "getShopIndex" : isShopEditorCheck,
            'buyAsset': isShopEditorCheck,
            'getTheme': userIsLogged,
            'setTheme': userIsLogged
        },
        "assetsAPI" : {
            "getAssetNamesArray" : roleIsMasterCheck,
            "getGlobalAssetDisplayNames" : userIsLogged,
            "getAsset" : userIsLogged,
            "createAsset" : roleIsMasterCheck,
            "renameAsset" : roleIsMasterCheck,
            "removeAsset" : roleIsMasterCheck,
            "updateAssetField" : roleIsMasterCheck,
        },
        "userAPI" : {
            "getUser" : forbidden,
            "setPassword" : forbidden,
            "checkPassword" : forbidden,
            "login" : forbidden,
            "register" : forbidden,
            "getShopName": roleIsPlayer
        },
        "permissionAPI" : {
            "hasPermission" : forbidden
        },
        "logAPI" : {
            "log" : forbidden,
            "getLog" : roleIsMasterCheck
        }
    };
    
    var apiInfoObj = R.mergeAll(R.values(apiInfo));
    
    opts.custom.permissionAPIList = R.keys(apiInfoObj);

    LocalDBMS.prototype.hasPermission = function(command, args, user){
        if(apiInfoObj[command] !== null){
            log.info('hasPermission: ' + command);
            var err = apiInfoObj[command](this.database, command, args, user);
            return err === null ? null : PC.makeValidationError(err);
        }
        return PC.makeValidationError(unknownCommand(command));
    };
};