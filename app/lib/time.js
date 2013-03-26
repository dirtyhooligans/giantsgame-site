var SECOND = 1000,
	MINUTE = SECOND * 60,
	HOUR   = MINUTE * 60,
	DAY    = HOUR * 24
	;

module.exports = {
	SECOND : SECOND,
	MINUTE : MINUTE,
	HOUR   : HOUR,
	DAY    : DAY,

	now : function()
	{
		return new Date().getTime();
	},

	hours : function(n)
	{
		return HOUR * n;
	},

	days : function(n)
	{
		return this.hours(24) * n;
	},

	hourOf : function(time)
	{
		var t = new Date(time || this.now());
		return t.getTime() - t.getMinutes() * MINUTE - t.getSeconds() * SECOND - t.getMilliseconds();
	},

	dayOf : function(time)
	{
		var t = new Date(time || this.now());
		return t.getTime() - t.getMinutes() * MINUTE - t.getHours() * HOUR - t.getSeconds() * SECOND - t.getMilliseconds();
	}
};
