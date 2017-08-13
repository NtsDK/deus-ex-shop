var config = require('../config');
var fs = require("fs");
var path = require("path");
var log = require('../libs/log')(module);

var copyNumber = config.get('autosave:copyNumber');
var root = config.get('autosave:root');

var projectName = config.get('inits:projectName');

function loadLastDatabase(){
    var filePath, stat, file, date;
    for (var i = 0; i < copyNumber; i++) {
        log.info(i);
        filePath = path.normalize(path.join(root, projectName + "-base" + (i+1) + ".json"));
        try {
            stat = fs.statSync(filePath);
            if(!file){
                file = filePath;
                date = stat.mtime;
            } else if(date < stat.mtime){
                file = filePath;
                date = stat.mtime;
            }
            log.info(date);
        } catch(e){
            log.error("Error on file check: " + filePath + ", " + e);
        }
    }
    if(file){
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } else {
        return;
    }
};

exports.loadLastDatabase = loadLastDatabase;