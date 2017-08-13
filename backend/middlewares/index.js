module.exports = function (app) {
    app.use(require('./echoAuth'));
    app.use(require('./sendHttpError'));
    app.use(require('./sendValidationError'));
    app.use(require('./requestProcessing'));
};