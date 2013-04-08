var express    = require('express'),
    assert     = require('assert'),
    async      = require('async'),
    config     = require('../../config'),
    //db         = require('../../db'),
    logger     = require('../../lib/logger'),
    tpl        = require('./templates'),
    schedule   = require('../../lib/schedule_util'),
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

app.get('/', function(request, response)
{
    //config.modifyByHost(request.host);
    //config.setHost(request.host);

    var format = request.query['f'] || 'html',
        day = request.query['d'] || request.query['day'] || null,
        days = request.query['ud'] || null,
        from = request.query['from'] || null,
        result = {};
        ;
    logger.info('searching for: ' + day);
    
    var options = {
        day : day,
        days  : days,
        from : from
    };

    schedule.getByDate(options, function(err, data) {

        result = data;

        schedule.getUpcoming(options, function(err, data) {

            result.upcoming = data;

            if ( err ) {
                    response.json({
                        query : result,
                        error : true,
                        data  : err
                    });
            }
            else {
                if ( format == 'html' ) {
                    tpl.getTemplate('home', result, function(err, template) {
                        //console.log('template context: ', result);
                        response.send({
                            query : options,
                            error : false,
                            data  : result,
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

app.get('/full', function(request, response)
{
    //global.site = request.host;

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

app.get('/upcoming', function(request, response)
{
    //global.site = request.host;

    var format = request.query['f'] || 'html',
        days    = request.query['d'] || request.query['days'] || null,
        from   = request.query['from'] || null
        ;
    logger.info('searching for: ' + days);
    
    var options = {
        days  : days,
        from : from
    };


    schedule.getUpcoming(options, function(err, data) {

        if ( err ) {
                response.json({
                    query : data,
                    error : true,
                    server_time : moment(),
                    data  : err
                });
        }
        else {
            if ( format == 'html' ) {   
                tpl.getTemplate('schedule/upcoming', data, function(err, template) { 
                    // response.locals = {
                    //     games : data,
                    //     query : options,
                    //     error : false,
                    //     server_time : moment()
                    // };

                    response.send(template);
                });
            }
            else
            {
                tpl.getTemplate('schedule/upcoming', data, function(err, template) {
                    console.log('template context: ', template);
                    response.json({
                        query : options,
                        error : false,
                        server_time : moment(),
                        data  : data,
                        display : template
                    });
                });

            }
        }
    });

});

app.get('/boxscore', function(request, response)
{
    var data = {
        innings : [
            {
                inning : '1',
                away_inning_runs : '0',
                home_inning_runs : '0'
            },
            {
                inning : '2',
                away_inning_runs : '0',
                home_inning_runs : '0'
            },
            {
                inning : '3',
                away_inning_runs : '0',
                home_inning_runs : '0'
            },
            {
                inning : '4',
                away_inning_runs : '0',
                home_inning_runs : '1'
            },
            {
                inning : '5',
                away_inning_runs : '0',
                home_inning_runs : '0'
            },
            {
                inning : '6',
                away_inning_runs : '1',
                home_inning_runs : '0'
            },
            {
                inning : '7',
                away_inning_runs : '0',
                home_inning_runs : '0'
            },
            {
                inning : '8',
                away_inning_runs : '1',
                home_inning_runs : '0'
            },
            {
                inning : '9',
                away_inning_runs : '0',
                home_inning_runs : '0'
            },
        ]
    };

    tpl.getTemplate('schedule/boxscore', data, function(err, template) { 
            response.send(template);
        });
});

