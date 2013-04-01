var logger   = require('./logger'),
    config   = require('../config'),
    async    = require('async'),
    fs       = require('fs'),
    http     = require('http'),
    moment   = require('moment'),
    request  = require('request')
    ;

module.exports = {
    getGameDataByUrl : function(url, callback) {
        //console.log('getGameDataByUrl: ' + url);
        var r = request(url, function (err, res) {
            //console.log('err: ', err, 'res: ', res);
            result = JSON.parse(res.body).data.game;
            callback(err, result);
          });
    }
};