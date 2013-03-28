var logger   = require('./logger'),
    config   = require('../config'),
    async    = require('async'),
    fs       = require('fs'),
    http     = require('http'),
    ical     = require('ical'),
    moment   = require('moment')
    ;

function getSchedule(url, callback) {
    var events = [],
        file
        ;

    var path = __dirname + '/../tmp/'+moment().format('YYYYMMDD')+'-schedule-full.json';
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

function trim(str) {
    if ( str )
        return str.replace(/^\s+|\s+$/g, '');
    else
        return null;
}

function parseEvent(data) {

    var result = data,
        extract_teams
        ;

    summary = data.summary;
    console.log(summary);
    
    result.isSpringTraining = summary.search(/Spring:/) > -1 ? true : false;
    if ( result.isSpringTraining )
        summary = summary.replace('Spring: ', '');
    
    result.inTheFuture = summary.search(/at/) > -1 ? true : false;

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


    return result;
}

function formatDisplayDay(date) {
    var result = '';

    if ( moment(date).format('YYYYMMDD') == moment().format('YYYYMMDD') )
        result = 'Today';
    else if( moment(date).format('YYYYMMDD') == moment().add('days', 1).format('YYYYMMDD') )
        result = 'Tomorrow';
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
        console.log(date);

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
                result.log['day_before_str'] = day_before_str;
                result.log['day_after_str']  = day_after_str;
                result.log.evt = []
                
                for ( var i = 0; i < total_events; i++ )
                {
                    evt_date_str = moment(data[i].start).format('YYYYMMDD');
                    result.log.evt.push(evt_date_str);

                    if ( evt_date_str == day_str ) {
                        result.schedule['day_of'] = parseEvent(data[i]);
                        if ( data[i+1] )
                            result.schedule['next_game'] = parseEvent(data[i+1]);
                        if ( data[i-1] )
                            result.schedule['previous_game'] = parseEvent(data[i-1]);

                        result.log['day_str'] = day_str;
                    }
                    else if ( evt_date_str == day_before_str ) {
                        result.schedule['day_before'] = parseEvent(data[i]);
                        result.log['day_before'] = day_before;
                    }
                    else if ( evt_date_str == day_after_str ) {
                        result.schedule['day_after'] = parseEvent(data[i]);
                        result.log['day_after'] = day_after;
                    }
                }

                callback.apply(undefined, [err, result])
            });
                    
    }
};