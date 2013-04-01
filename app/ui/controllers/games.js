var express    = require('express'),
    assert     = require('assert'),
    async      = require('async'),
    config     = require('../../config'),
    //db         = require('../../db'),
    logger     = require('../../lib/logger'),
    tpl        = require('./templates'),
    mlbcom     = require('../../mlbcom_util.js'),
    moment     = require('moment')
    ;

var app = module.exports = express();

app.configure(function()
{
    app.use(express.errorHandler({
        dumpExceptions : true,
        showStack      : true
    })); 
});

app.get('/getdatabyurl', function(request, response)
{
    //config.modifyByHost(request.host);
    
    var url  = request.query['u'] || false,
        date = request.query['d'] || false
        ;
    logger.info('searching for: ' + url);
    
    var options = {
                    url  : url,
                    date : date
                  };

    mlbcom.getGameDataByUrl(options, function(err, data) {

        if ( err ) {
                response.json({
                    query : data,
                    error : true,
                    data  : err
                });
        }
        else {
            if ( format == 'html' ) {
                tpl.getTemplate('home', data, function(err, template) {
                    // console.log('template context: ', res);
                    response.send({
                        query : options,
                        error : false,
                        data  : data,
                        display : template
                    });
                });
            }
            else
            {
                response.json({
                    query : options,
                    error : false,
                    data  : data
                });
            }
        }
    });

});





});


