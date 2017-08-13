var config = require('../../config');

exports.initAPIs = function(commonFunc, serverFunc){
    ["baseAPI"               ,
     "consistencyCheckAPI"   ,
     "entityAPI"             ,
     "shopAPI"               ,
     "assetsAPI"             ,
     "externalAPI"           ,
    ].map(commonFunc);

    ["userAPI"               ,
     "externalOverridesAPI"  ,
     "permissionAPI"         ,
     ].map(serverFunc);

    commonFunc('logAPI');
};

exports.populateDatabase = function(database){
    database.Master = {name: config.get('inits:adminLogin'), password: config.get('inits:adminPass')};
};

