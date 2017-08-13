var db = require('../dbms').db;
var config = require('../config');
var fs = require("fs");
var path = require("path");
var log = require('../libs/log')(module);

var copyNumber = config.get('autosave:copyNumber');
var root = config.get('autosave:root');

var projectName = config.get('inits:projectName');

var curIndex=0;
setInterval(function(){
    log.info(curIndex++);
    if(curIndex>=copyNumber){
        curIndex=0;
    }
    var filePath = path.normalize(path.join(root, projectName + "-base" + (curIndex+1) + ".json"));
    log.info('filePath:' + filePath);
    
//  fs.writeFile(filePath, filePath, function(err) {
    db.getDatabase(function(err, data){
        if (err) return console.err(err);
        fs.writeFile(filePath, JSON.stringify(data, null, 2), function(err) {
            if (err) return console.err(err);
        });
    });
    
}, config.get('autosave:interval'));


