var express   = require('express'),
    less      = require('less'),
    fs        = require('fs'),
    path      = require('path'),
    //db        = require('../../db'),
    config    = require('../../config'),
    logger    = require('../../lib/logger'),
    gitUtil   = require('../../lib/git_util')

    ;

var app  = module.exports = express(),
    RedisStore = require('connect-redis')(express),
    redis = require("redis").createClient(),
    home = __dirname + '/..'
    ;

process.on('uncaughtException', function(err)
{
    logger.error(err.stack);
});

app.configure(function()
{
    //db.connect();

    app.set('views', home + '/views');
    app.set('view engine', 'jade');

    app.engine('less', less.render);

    app.use(express.errorHandler({
        dumpExceptions : true,
        showStack      : true
    })); 

    app.use(express.cookieParser(config.info.cookieKey));
    app.use(express.session(config.session));

    app.use(express.session({
      secret: config.session.key,
      store: new RedisStore({ host: 'localhost', port: config.info.port, client: redis })
    }));

    app.use(express.bodyParser());
    app.use(express.static(home + '/public'));
   
    app.use(app.router);
    
    app.use('/about', require('./about'))
    app.use('/schedule', require('./schedule'));

    // the error handler is strategically placed *below* the app.router; if it
    // were above it would not receive errors from app.get() etc 
    app.use(require('../../lib/errors').middleware);

    gitUtil.getCurrentVersion(__dirname, function(err, version)
    {
        if(err)
            throw new Error('Unable to determine GIT version, is .git folder missing?\n\n' + err.stack);

        logger.info(version);
        config.version = version;
    });

});


app.get('/', function(request, response)
{
    //config.modifyByHost(request.host);

    response.locals = {
        config : config
    };
    response.render('app');
});

/**
 * Renders LESS files to the output when CSS file is requested. No caching happens here
 * because it's assumed that if it's needed, something like varnish will take care of that.
 */
app.get('/css/*', function(request, response, next)
{
    if(!/\.css$/.test(request.url))
        return next();

    var filePath = path.resolve(home + request.url.replace('.css', '.less')),
        options  = {
            compress : true,
            paths    : [ path.dirname(filePath) ]
        }
        ;

    fs.readFile(filePath, 'utf8', function(err, fileContent)
    {
        less.render(fileContent, options, function(err, css)
        {
            response.contentType('text/css');
            response.statusCode = err ? 500 : 200;
            
            response.write(err ? JSON.stringify(err) : css);
            response.end();
        });
    });
});