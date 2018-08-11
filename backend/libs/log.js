var winston = require('winston');
var dateFormat = require('dateformat');

var ENV = process.env.NODE_ENV;

// can be much more flexible than that O_o
function getLogger(module) {

//  var path = module.filename.split('/').slice(-2).join('/');
  var path = module.filename.split('\\').slice(-2).join('\\');

  
  return winston.createLogger({
    transports: [
      new winston.transports.Console({
        timestamp: function() {
//          return Date.now();
          return dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss.l");
        },
        formatter: function(options) {
          // Return string will be passed to logger.
          return '[' + options.timestamp() +'] '+ options.level.toUpperCase() +': '+ (options.message);
        },
        colorize: true,
//        level: (ENV == 'development') ? 'debug' : 'error',
        level: 'debug',
        label: path
      })
    ]
  });
}

module.exports = getLogger;