var scheduleData,
    timezoneOffset = -3 // EST to PST
    ;

var updateSchedule = function(date) {
    console.log(date);
}

var initSchedule = function() {
    console.log('initSchedule', pageData.data.schedule);
    scheduleData = pageData.data.schedule;

    var todaysGame = scheduleData.day_of || {};
    var nextGame = scheduleData.next_game || {};

    $("#nextgame_time h4").html(moment(nextGame.start).add('hours', timezoneOffset).format('LT'));

    $("#dayof-gametime h3").html(moment(todaysGame.start).add('hours', timezoneOffset).format('LT'));

    if ( todaysGame.scores )
    {
        var gametime_title,
            gametime
            ;
        if ( todaysGame.teams.home == 'San Francisco' )
        {
            if ( todaysGame.scores.home > todaysGame.scores.away )
            {
                gametime_title = 'yay.. they';
                gametime = 'WON';
            }
            else
            {
                gametime_title = 'oh darn, they';
                gametime = 'LOST';
            }
        }
        else
        {
            if ( todaysGame.scores.home < todaysGame.scores.away )
            {
                gametime_title = 'yay.. they';
                gametime = 'WON';
            }
            else
            {
                gametime_title = 'oh darn, they';
                gametime = 'LOST';
            }
        }
        
        $("#dayof-gametime-title").html(gametime_title);
        $("#dayof-gametime h3").html(gametime);
    }
}

initSchedule();