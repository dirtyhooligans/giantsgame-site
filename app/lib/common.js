var crypto  = require('crypto'),
	http    = require('http'),
	url     = require('url'),
	util    = require('util'),
	spawn   = require('child_process').spawn,
	config  = require('../config'),
	errors  = require('./errors'),
	time    = require('./time'),
	accents = require('./accent_map')
	;

module.exports = {
	// func.apply() way of creating a new object with array of arguments
	construct : function(constructor, args)
	{
		function F()
		{
			return constructor.apply(this, args);
		};

		F.prototype = constructor.prototype;

		return new F();
	},
	
	inspect : function(object)
	{
		return util.inspect(object, false, 10, true);
	},

	// for compatability sake
	spawn : require('./process_util').spawn,

	extend : function(destination, source)
	{
		for(var key in source)
			if(source.hasOwnProperty(key))
				destination[key] = source[key];

		return destination;
	},

	clone : function(obj)
	{
		return JSON.parse(JSON.stringify(obj));
	},

	md5 : function(source)
	{
		var hash = crypto.createHash('md5');
		hash.update(source);
		return hash.digest('hex');
	},

	sha1 : function(data)
	{
		return crypto.createHash('sha1').update(data).digest('hex');
	},

	id : function(prefix)
	{
		return ((prefix || '') + this.sha1(Math.random() * time.now() + config.info.salt)).substr(0, 32);
	},

	isArray : function(target)
	{
		return this.getClassName(target) === '[object Array]';
	},

	getClassName : function(target)
	{
		return Object.prototype.toString.apply(target);
	},

	ip2int : function(ip) 
	{
		var parts = ip.split('.');

		return parseInt(parts[0], 10) * 256 * 256 * 256
			+ parseInt(parts[1], 10) * 256 * 256
			+ parseInt(parts[2], 10) * 256
			+ parseInt(parts[3], 10)
			;
	},

	argumentsToArray : function(args)
	{
		return Array.prototype.slice.apply(args);
	},

	filterKeys : function(source, keys)
	{
		var result = {}, i;

		keys = keys.split(' ');

		for(i = 0; i < keys.length; i++)
			result[keys[i]] = source[keys[i]];

		return result;
	},

	// Remove Diacritics
	// from http://www.alistapart.com/articles/accent-folding-for-auto-complete/
	removeDiacritics : function(str)
	{
		if (!str) 
			return '';

		var result = '';

		for (var i = 0; i < str.length; i++)
			result += accents[str.charAt(i)] || str.charAt(i);

		return result;
	},

	slug : function(str)
	{
		return this.removeDiacritics(str)
			.toLowerCase()
			.replace(/\W+/g, ' ')
			.replace(/^\s+|\s+$/g, '')
			.replace(/\s+/, '-')
			;
	},

	trim : function(str)
	{
		return str.replace(/^\s+|\s+$/g, '');
	}
};


