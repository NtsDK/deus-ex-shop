var express       = require('express');
var path          = require('path');
var favicon       = require('serve-favicon');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var passport      = require('passport');
var session       = require('express-session');
var errorHandler  = require('errorhandler');
var compression   = require('compression');
var cors          = require('cors')

var config        = require('./config');
var log           = require('./libs/log')(module);
var HttpError     = require('./error').HttpError;
require('./autosave');

var app = express();

var sessionOptions = config.get("session");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev', {
    immediate : true,
    format : 'dev'
}));
app.use(logger('dev', {
    format : 'dev'
}));

if(config.get("api:enabled")){
    var corsOpts = {
            origin: true,
            credentials: true
    };
    
    app.use(cors(corsOpts));
    app.options('*', cors());
}
log.info('api enabled: ' + config.get("api:enabled"));
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

if(config.get("compression:enabled")){
    app.use(compression());
}
log.info('compression enabled: ' + config.get("compression:enabled"));

require('./boot')(app);
require('./middlewares')(app);
require('./routes')(app);

app.use(express.static(config.get('frontendPath')));

app.use(function(err, req, res, next) {
    console.error(new Date().toString() + ' ' + err);
    if (typeof err == 'number') { // next(404);
        err = new HttpError(err);
    }

    if (err instanceof HttpError) {
        res.sendHttpError(err);
//  } else if (err instanceof Errors.ValidationError) {
    } else if (err.name === 'ValidationError') {
        res.sendValidationError(err);
    } else {
        if (app.get('env') == 'development') {
            errorHandler()(err, req, res, next);
        } else {
            log.error(err);
            err = new HttpError(500);
            res.sendHttpError(err);
        }
    }

});

module.exports = app;
