var winston = require('winston'),
	common  = require('winston/lib/winston/common'),
	config  = require('../config')
	;

var log        = common.log,
	appName    = global.APP_NAME || 'APP_NAME',
	transports = winston.transports,
	loggerTransports,
	logger
	;

loggerTransports = [
	appName !== 'syncdb' 
		? new transports.File({
			level     : 'trace',
			timestamp : true,
			json      : false,
			filename  : config.paths.logs
		})

		: new transports.Console({
			level     : 'trace',
			timestamp : false,
			json      : false,
		})
];

logger = new winston.Logger({
	levels : {
		trace : 0,
		debug : 1,
		info  : 2,
		warn  : 3,
		error : 4
	},
	transports : loggerTransports
});

winston.addColors({
	trace : 'grey',
	debug : 'green',
	info  : 'cyan',
	warn  : 'yellow',
	error : 'red'
});

common.log = function()
{
	return '[' + appName + '] ' + log.apply(common, arguments);
};

module.exports = logger;
