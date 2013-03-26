var util   = require('util'),
	logger = require('./logger'),
	config = require('../config')
	;

function AppError(message, data)
{
	data         = data || {};
	data.message = message;

	if(!data.stack)
	{
		var error = new Error(message);

		Error.apply(error, [ message ]);
		Error.captureStackTrace(error, arguments.callee);

		data.stack = error.stack;
	}

	for(var key in data || {})
		Object.defineProperty(this, key, { value : data[key], enumerable : true });
}

util.inherits(AppError, Error);
AppError.constructor = AppError;

AppError.prototype.toString = function()
{
	return this.message;
}

function error(statusCode, send)
{
	function constructor(message, data)
	{
		var error = new Error(message);

		Error.apply(error, [ message ]);
		Error.captureStackTrace(error, arguments.callee);

		data            = data || {};
		data.stack      = error.stack;
		data.statusCode = statusCode;

		AppError.apply(this, [ message, data ]);
	}

	util.inherits(constructor, AppError);

	constructor.prototype.constructor = constructor;

	constructor.prototype.send = function(request, response)
	{
		response.statusCode   = this.statusCode;
		response.locals.error = this;

		if(request.xhr === true)
		{
			response.contentType = 'application/json';
			response.send({ errors : [ this ] });
		}
		else
		{
			send.call(this, request, response);
		}
	};

	return constructor;
}

module.exports = {
	AppError : AppError,

	AuthError : error(401, function(request, response)
	{
		response.render('errors/auth');
	}),

	NotFoundError : error(404, function(request, response)
	{
		response.render('errors/404');
	}),

	PublicError : error(500, function(request, response)
	{
		response.render('errors/500');
	}),

	SystemError : error(500, function(request, response)
	{
		response.render('errors/500');
	}),

	DataError : error(500, function(request, response)
	{
		response.send({ message : this.message });
	}),

	JsonError : error(500, function(request, response)
	{
		response.send({ message : this.message });
	}),

	JavaScriptError : error(500, function(request, response)
	{
		response.contentType = 'text/javascript';
		response.send('"' + (this.message || '').replace(/"/g, '\\"') + '"');
	}),

	RedirectError : error(302, function(request, response)
	{
		response.redirect(this.url);
	}),

	middleware : function(err, request, response, next)
	{
		if(err instanceof AppError && err.send)
		{
			err.send(request, response);
		}
		else
		{
			logger.error(err);
			//response.locals.error = err;
			response.locals = {
				error : err,
		        config : config
		    };
			response.render('errors/500');
		}
	}
};




