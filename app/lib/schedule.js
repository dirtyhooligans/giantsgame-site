var logger   = require('./logger'),
    config   = require('../config'),
    async    = require('async'),
    fs       = require('fs'),
    http     = require('http'),
    ical     = require('ical')
    ;

function getSchedule(url, path, callback) {
    var events = [],
        file
        ;

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

    String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};

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
    
    //result.teams = extract_teams;


    return result;
}

module.exports = {

    getByDay : function(options, callback) {
        var result = options,
            err = false, 
            cal_file,
            tmp_file
            ;

            Date.prototype.yyyymmdd = function() {
               var yyyy = this.getFullYear().toString();
               var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
               var dd  = this.getDate().toString();
               return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
              };

            d = new Date();
            //d.yyyymmdd();

            cal_file = __dirname + '/../tmp/'+d.yyyymmdd()+'-sf-schedule-full.json';

            getSchedule(config.schedule.full, cal_file, function(err, data){

                var total_events  = data.length,
                    today         = new Date(),
                    today_str     = today.getUTCFullYear().toString() + 
                                    today.getUTCMonth().toString() + 
                                    today.getUTCDate().toString(),

                    yesterday     = new Date();
                    yesterday.setDate(today.getDate() - 1);
                var yesterday_str = yesterday.getUTCFullYear().toString() + 
                                    yesterday.getUTCMonth().toString() + 
                                    yesterday.getUTCDate().toString(),

                    tomorrow      = new Date();
                    tomorrow.setDate(today.getDate() + 1);
                var tomorrow_str  = tomorrow.getUTCFullYear().toString() + 
                                    tomorrow.getUTCMonth().toString() + 
                                    tomorrow.getUTCDate().toString()
                    ;
                result.schedule = {};
                
                for ( var i = 0; i < total_events; i++ )
                {
                    evt_date = new Date(data[i].start);
                    evt_date_str = evt_date.getUTCFullYear().toString() + evt_date.getUTCMonth().toString() + evt_date.getUTCDate().toString();
                    
                    if ( evt_date_str == today_str ) {
                        //data[i].date_string = evt_date_str + ' == ' + today_str;
                        result.schedule['today'] = parseEvent(data[i]);
                    }
                    else if ( evt_date_str == yesterday_str ) {
                        //data[i].date_string = evt_date_str + ' == ' + today_str;
                        result.schedule['yesterday'] = parseEvent(data[i]);
                    }
                    else if ( evt_date_str == tomorrow_str ) {
                        //data[i].date_string = evt_date_str + ' == ' + today_str;
                        result.schedule['tomorrow'] = parseEvent(data[i]);
                    }
                }

                callback.apply(undefined, [err, result])
            });
                    
    }
};