var express    = require('express'),
    assert     = require('assert'),
    async      = require('async'),
    config     = require('../../config'),
    logger     = require('../../lib/logger'),
    tpl        = require('./templates')
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
    
    tpl.getTemplate('about', {}, function(err, template) {
                    // console.log('template context: ', res);
                    response.send({
                        error : false,
                        data  : {},
                        display : template
                    });
                });

});


