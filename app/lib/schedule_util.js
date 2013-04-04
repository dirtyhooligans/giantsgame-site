var logger   = require('./logger'),
    config   = require('../config'),
    async    = require('async'),
    fs       = require('fs'),
    http     = require('http'),
    ical     = require('ical'),
    moment   = require('moment'),
    mlbcom   = require('./mlbcom_util')
    ;

function getSchedule(url, callback) {
    var events = [],
        file
        ;

    var path = __dirname + '/../tmp/'+config.mlb.code+'-'+moment().format('YYYYMMDD')+'-schedule-full.json';
    var file_exists = fs.existsSync(path);

    if ( file_exists )
    {
        file = fs.readFile(path, function(err, data){
            callback.apply(undefined, [err, JSON.parse(data)]);
        });
    }
    else
    {
        ical.fromURL(url, {}, function(err, data) {
            //console.log(data);
            for ( var k in data )
            {
                if ( data.hasOwnProperty(k) )
                {
                    var ev = data[k];

                    if ( ev.type == 'VEVENT' )
                    {
                        events.push(ev);
                    }
                }
            }
            fs.writeFile(path, JSON.stringify(events), function(err){
                callback.apply(undefined, [err, events]);
            });
        });
    }
}
// http://mlb.mlb.com/mlb/gameday/index.jsp?gid=2013_03_29_oakmlb_sfnmlb_1
function makeMlbUrlFromEventData(url, date) {
    // example url: http://gd2.mlb.com/components/game/mlb/year_2013/month_03/day_29/gid_2013_03_29_oakmlb_sfnmlb_1/linescore.json
    var resultUrl = 'http://gd2.mlb.com/components/game/mlb/',
        evt_id = url.replace('http://mlb.mlb.com/mlb/gameday/index.jsp?gid=', '')
        ;

        resultUrl += 'year_' + moment(date).format('YYYY') + '/';
        resultUrl += 'month_' + moment(date).format('MM') + '/';
        resultUrl += 'day_' + moment(date).format('DD') + '/';

        resultUrl += 'gid_' + evt_id + '/';

        resultUrl += 'linescore.json';

        return resultUrl;
}

function trim(str) {
    if ( str )
        return str.replace(/^\s+|\s+$/g, '');
    else
        return null;
}

function parseEvent(data, callback) {

    var result = data,
        extract_teams
        ;

    summary = data.summary;
    //console.log(summary);
    
    result.isSpringTraining = summary.search(/Spring:/) > -1 ? true : false;
    if ( result.isSpringTraining )
        summary = summary.replace('Spring: ', '');

    result.hasScore = summary.search(/\-/) > -1 ? true : false;

    result.summary = summary;

    result.teams = {};

    if ( result.hasScore )
    {
        result.scores = {};

        extract_teams = summary.split('-');
        away_team_score = trim(extract_teams[0]).match(/([\w ]+) (\d+)/);
        home_team_score = trim(extract_teams[1]).match(/([\w ]+) (\d+)/);

        result.teams['away'] = away_team_score[1];
        result.teams['home'] = home_team_score[1];

        result.scores['away'] = away_team_score[2];
        result.scores['home'] = home_team_score[2];
    }
    else
    {
        extract_teams = summary.split('at');
        
        result.teams['away'] = trim(extract_teams[0]);
        result.teams['home'] = trim(extract_teams[1]);
    }

    result.displayDay = formatDisplayDay(data.start);
    //result.teams = extract_teams;
    result.mlbGameDataUrl = makeMlbUrlFromEventData(data.url, data.start);

    var matchCode = new RegExp("mlb_"+config.mlb.code+"mlb", 'g');
    result.teamIsHome = result.mlbGameDataUrl.match(matchCode) ? true : false;

    //console.log(result.mlbGameDataUrl);

    mlbcom.getGameDataByUrl(result.mlbGameDataUrl, function(err, data){
        //console.log('data: ', data);
        if ( data.home_team_city == 'LA Dodgers')
            data.home_team_city = 'Los Angeles';
        if ( data.away_team_city == 'LA Dodgers')
            data.away_team_city = 'Los Angeles';

        result.inTheFuture = (data.status == 'Pre-Grame' || data.status == 'Preview') ? true : false;
        result.gameStatus = data.status || 'Unknown';
        result.gameData = data;
        callback(err, result); 
    });



    //return result;
}

function formatDisplayDay(date) {
    var result = '';

    if ( moment(date).format('YYYYMMDD') == moment().format('YYYYMMDD') )
        result = 'Today';
    else if( moment(date).format('YYYYMMDD') == moment().add('days', 1).format('YYYYMMDD') )
        result = 'Tomorrow';
    else if( moment(date).format('YYYYMMDD') == moment().add('days', -1).format('YYYYMMDD') )
        result = 'Yesterday';
    else if( moment(date).isBefore(moment().add('days', 7)) ) 
    {
        result = moment(date).format('dddd');
    }
    else if( moment(date).isAfter(moment().add('days', 7)) 
             && moment(date).isBefore(moment().add('days', 14)) ) 
    {
        result = 'Next ' + moment(date).format('dddd');
    }
    else
        result = moment(date).format('MMM Do');

    return result;
}

module.exports = {

    getFullSchedule : function(options, callback) {
        var result = {}
            ;
        getSchedule(config.schedule.full, function(err, data){
            result.total  = data.length;
            result.events = data;
            callback.apply(undefined, [err, result])
        });
    },

    getUpcoming : function(options, callback) {
        var result = {},
            err = false,
            days = options.days || 7,
            from_str = options.from ? moment(from).format('YYYY-MM-DD') : moment().add('days', 1).format('YYYY-MM-DD')
            ;
console.log(config.schedule.full);

        days = parseInt(days);

        getSchedule(config.schedule.full, function(err, data){

            var total_events = data.length,
                events = [],
                from_idx,
                next_game_date
                ;

            function getNextGameIndex(date_str, start) {
                //console.log(date_str);
                var start_idx = start || 0,
                    idx = -1;
                    ;
                for ( var i = start_idx; i < total_events; i++ )
                {
                    evt_date_str = moment(data[i].start).format('YYYY-MM-DD');

                    if ( evt_date_str == date_str )
                    {
                        next_game_date = evt_date_str;
                        idx = i;
                        break;
                    }
                }
                if ( idx > -1 )
                    return idx;
                else
                    return getNextGameIndex(moment(date_str).add('days', 1).format('YYYY-MM-DD'));
            }
            
            // console.log(getNextGameIndex(from_str));
            current_idx = getNextGameIndex(from_str);
            
            needed_days = days + moment(from_str).diff(moment(next_game_date), 'days');
            
            games = {};
            games_arr = [];
//console.log(days);
            
            for ( var d = 0; d <= days; d++ ) {
                games[moment(from_str).add('days', d).format('YYYY-MM-DD')] = {
                    'isGame' : false,
                    'formatDay' : {
                        'M/D' : moment(from_str).add('days', d).format('M/D'),
                        'MMM D' : moment(from_str).add('days', d).format('MMM D'),
                        'ddd' : moment(from_str).add('days', d).format('ddd'),
                        'dddd' : moment(from_str).add('days', d).format('dddd')   
                    }
                };
            }

//console.log(games);
            
            while(needed_days > 0){
                if ( data[current_idx] ) {
                    games_arr.push(data[current_idx]);
                    needed_days--;
                    current_idx++;
                }
                else
                    current_idx++;
            }
//console.log(games);

            async.each(games_arr, 
                        function(game, callback) {

                            parseEvent(game, function(err, data){
                                //console.log(data);
                                //games[game.day] = data;
                                if ( err )
                                    console.log('err: ', err)
                                else
                                {
                                    var key = moment(data.start).format("YYYY-MM-DD");
                                    var gameDay = games[key];
                                    //console.log('gameDay ['+key+']: ', gameDay);
                                    if ( gameDay )
                                        data.formatDay = gameDay.formatDay;
                                    data.isGame = true;
                                    games[key] = data;
                                }
                                callback(err);
                            });
                            
                        },
                        function(err) {
                            //console.log(result);

                            // for ( g in games ) {
                            //     result.schedule[g] = games[g];
                            // }
                            //console.log(result);

                            callback.apply(undefined, [err, {'games' : games}])
                        }
                    );
        });
    },

    getByDate : function(options, callback) {
        var result = options,
            err    = false,
            day    = options.day || false,
            date
            ;

        if ( day ) 
        {
            switch (day) {
                case 'tomorrow' :
                    date = moment().add('days', 1);
                    break;
                case 'yesterday' :
                    date = moment().add('days', -1);
                    break;
                case 'today' : 
                    date = moment();
                    break;
                default :
                    day = 'today';
                    date = moment();
                    break;
            }
        }
        else 
        {
            day = 'today';
            date = moment();
        }
        //console.log(date);

        var day_before = moment(date).subtract('days', 1),
            day_after  = moment(date).add('days', 1)
            ;
        var day_str        = date.format('YYYYMMDD'),
            day_before_str = day_before.format('YYYYMMDD'),
            day_after_str  = day_after.format('YYYYMMDD')
            ;


            getSchedule(config.schedule.full, function(err, data){

                var total_events = data.length;

                result.schedule = {};
                result.search = {};
                result.search.display = day ? day.charAt(0).toUpperCase() + day.slice(1) : formatDisplayDay(date);

                result.log = {};
                //result.log['day_before_str'] = day_before_str;
                //result.log['day_after_str']  = day_after_str;
                result.log.evt = [];

                games_arr = [];
                day_of         = false;
                day_before     = false;
                day_after      = false;
                day_of_idx     = -1;
                day_after_idk  = -1;
                day_before_idk = -1;

                for ( var i = 0; i < total_events; i++ )
                {
                    evt_date_str = moment(data[i].start).format('YYYYMMDD');
                    //result.log.evt.push(evt_date_str);

                    if ( evt_date_str == day_str ) {

                        day_of = true;
                        day_of_idx = i;

                        games_arr.push({'day' : "day_of", 'data'  : data[i]});

                        //result.schedule['day_of'] = parseEvent(data[i]);
                        if ( data[i+1] )
                            games_arr.push({'day' : "next_game", 'data'  : data[i+1]});
                        // result.schedule['next_game'] = parseEvent(data[i+1]);
                        
                        // result.schedule['previous_game'] = parseEvent(data[i-1]);
                        if ( data[i-1] )
                            games_arr.push({'day' : "previous_game", 'data'  : data[i-1]});
                        //result.log['day_str'] = day_str;
                    }
                    else if ( evt_date_str == day_before_str ) {
                        //result.schedule['day_before'] = parseEvent(data[i]);
                        day_before = true;
                        day_before_idx = i;
                        games_arr.push({'day' : "day_before", 'data' : data[i], "index" : i});
                        //result.log['day_before'] = day_before;
                    }
                    else if ( evt_date_str == day_after_str ) {
                        //result.schedule['day_after'] = parseEvent(data[i]);
                        //result.log['day_after'] = day_after;
                        day_after = true;
                        day_after_idk = i;
                        games_arr.push({'day' : "day_after", 'data' : data[i], 'index' : i});
                    }
                }

                if (! day_of && day_after_idk > -1)
                {
                    games_arr.push({'day' : "next_game", 'data' : data[day_after_idk], 'index' : i});                    
                }

                if (! day_of && day_before_idx > -1 )
                {
                    games_arr.push({'day' : "previous_game", 'data' : data[day_before_idx], 'index' : i}); 
                }

                if (! day_before && day_of )
                {
                    day_before_idx = day_of_idx;

                    while(!day_before)
                    {
                        if ( data[day_before_idx] ) {
                            games_arr.push({'day' : "day_before", 'data' : data[day_before_idx], "index" : day_before_idx});
                            day_before = true;
                        }
                        else
                            day_before_idx++;
                    }
                }

                if (! day_after && day_of )
                {
                    day_after_idx = day_of_idx;

                    while(!day_after)
                    {
                        if ( data[day_after_idx] ) {
                            games_arr.push({'day' : "day_before", 'data' : data[day_after_idx], "index" : day_before_idx});
                            day_after = true;
                        }
                        else
                            day_after_idx++;
                    }
                }

                var games = [];

                if ( games_arr.length > 0 ) {

                    async.each(games_arr, 
                        function(game, callback) {

                            parseEvent(game.data, function(err, data){
                                //console.log(data);
                                games[game.day] = data;
                                callback(err);
                            });
                            
                        },
                        function(err) {
                            //console.log(result);

                            for ( g in games ) {
                                result.schedule[g] = games[g];
                            }
                            //console.log(result);

                            callback.apply(undefined, [err, result])
                        }
                    );
                }

                
            });
                    
    }
};