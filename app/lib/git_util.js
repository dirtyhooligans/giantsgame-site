var async       = require('async'),
	processUtil = require('./process_util')
	;

function getLatestHash(dir, callback)
{
	processUtil.spawn('git', [ 'log', '-n 1' ], { cwd : dir }, function(err, code, stdout, stderr)
	{
		if(err)
			return callback(err);

		if(code !== 0 || stderr)
			return callback(new Error(stderr));

		var hash = stdout.match(/^commit\s*(\w+)$/m)[1];

		callback(null, hash);
	});
}

function getTags(dir, callback)
{
	processUtil.spawn('git', [ 'show-ref', '--tags' ], { cwd : dir }, function(err, code, stdout, stderr)
	{
		if(err)
			return callback(err);

		if(code !== 0 || stderr)
			return callback(new Error(stderr));

		var result = {},
			regex = /^(\w{40}) refs\/tags\/(.*)$/gm,
			matches
			;

		while(matches = regex.exec(stdout))
			result[matches[1]] = matches[2];

		callback(null, result);
	});
}

function getCurrentVersion(dir, callback)
{
	async.parallel(
		{
			hash : async.apply(getLatestHash, dir),
			tags : async.apply(getTags, dir)
		},

		function(err, results)
		{
			if(err)
				return callback(err);

			callback(null, results.tags[results.hash] || results.hash);
		}
	);
}

module.exports = {
	getLatestHash     : getLatestHash,
	getTags           : getTags,
	getCurrentVersion : getCurrentVersion
};
