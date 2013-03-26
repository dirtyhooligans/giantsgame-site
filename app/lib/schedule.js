var logger   = require('./logger'),
    config   = require('../config'),
    async    = require('async'),
    fs       = require('fs'),
    http     = require('http'),
    ical     = require('ical')
    ;

function getSchedule(url, path, callback) {
    var events = [],
        file,
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
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
                        // console.log("Game ", 
                        //         ev.summary,
                        //         'is in',
                        //         ev.location,
                        //         'on the', 
                        //         ev.start.getDate(), 'of', months[ev.start.getMonth()]
                        //     );
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
                result.schedule = data
                callback.apply(undefined, [err, result])
            });
                    
    }
};