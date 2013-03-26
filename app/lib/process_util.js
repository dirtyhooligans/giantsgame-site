var spawn  = require('child_process').spawn,
	exec   = require('child_process').exec,
	logger = require('./logger')
	;

function merge(target, source)
{
	for(var key in source)
		target[key] = source[key];
	
	return target;
}

module.exports = {
	spawn : function(cmd, args, opts, callback)
	{
		if(!callback && typeof(opts) === 'function')
		{
			callback = opts;
			opts     = null;
		}

		if(opts && opts.env)
			opts.env = merge(merge({}, process.env), opts.env);

		logger.trace(cmd + ' ' + args.join(' '));

		var proc     = spawn(cmd, args, opts),
			stdout   = '',
			stderr   = '',
			exitCode = null
			;

		proc.stdout.on('data', function(data) { stdout += data.toString('utf-8'); });
		proc.stderr.on('data', function(data) { stderr += data.toString('utf-8'); });
		proc.once('exit', function(code) { exitCode = code; });
		proc.once('close', function() { callback(null, exitCode, stdout, stderr); });

		return proc;
	},

	exec : function(cmd, args, opts, callback)
	{
		if(!callback && typeof(opts) === 'function')
		{
			callback = opts;
			opts     = null;
		}

		if(opts && opts.env)
			opts.env = merge(merge({}, process.env), opts.env);

		logger.trace(cmd + ' ' + args.join(' '));

		args.unshift(cmd);

		exec(args.join(' '), opts, function(err, stdout, stderr)
		{
			callback(err, err ? err.code : 0, stdout, stderr);
		});
	}
};


