global.APP_NAME = 'ui';

var express = require('express'),
    logger  = require('../lib/logger'),
    config  = require('../config')
    ;

var app = express(),
    server
    ;

logger.info('http://localhost:' + config.info.port);

server = app.listen(config.info.port);

app.use('/', require('./controllers'));
