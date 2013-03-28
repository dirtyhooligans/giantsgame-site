var express    = require('express'),
    assert     = require('assert'),
    async      = require('async'),
    config     = require('../../config'),
    //db         = require('../../db'),
    logger     = require('../../lib/logger'),
    tpl        = require('./templates'),
    schedule   = require('../../lib/schedule_util')
    ;

var app = module.exports = express();

app.configure(function()
{
    app.use(express.errorHandler({
        dumpExceptions : true,
        showStack      : true
    })); 
});

app.get('/', function(request, response)
{
    var format = request.query['f'] || 'html',
        day = request.query['d'] || request.query['day'] || null
        ;
    logger.info('searching for: ' + day);
    
    var options = {
        day : day
    };

    schedule.getByDate(options, function(err, data) {

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

app.get('/full', function(request, response)
{
    var day  = request.query['d'] || 'today',
        format = request.query['f'] || 'html'
        ;
    logger.info('searching for: ' + day);
    
    var options = {
                    day : day
                  };

    schedule.getFullSchedule(options, function(err, data) {

        if ( err ) {
                response.json({
                    query : data,
                    error : true,
                    data  : err
                });
        }
        else {
            if ( format == 'html' ) {
                tpl.getTemplate('schedule', data, function(err, template) {
                    // console.log('template context: ', res);
                    response.json({
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





