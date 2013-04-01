var scheduleData,
    timezoneOffset = -3 // EST to PST
    upcomingLoaded = false;
    ;

var updateSchedule = function(date) {
    console.log(date);
}

var initSchedule = function() {
    console.log('initSchedule', pageData.data.schedule);
    scheduleData = pageData.data.schedule;

    var todaysGame = scheduleData.day_of || false;

    if ( todaysGame ) 
    {
        var gametime,
            gametime_title,
            isHomeTeam = (todaysGame.teams.home == 'San Francisco') ? true : false,
            team_name = isHomeTeam ? todaysGame.gameData.home_team_name : todaysGame.gameData.away_team_name,
            team_city = isHomeTeam ? todaysGame.gameData.home_team_city : todaysGame.gameData.away_team_city,
            opp_name  = isHomeTeam ? todaysGame.gameData.away_team_name : todaysGame.gameData.home_team_name,
            opp_city  = isHomeTeam ? todaysGame.gameData.away_team_city : todaysGame.gameData.home_team_city,
            location_info = todaysGame.location,

            team_score,
            team_probables_pitcher,
            opp_probables_pitcher
            ;
        if ( todaysGame.gameData.status == "Preview" )
        {
            //gametime_title = todaysGame.;
            gametime = moment(todaysGame.start).add('hours', timezoneOffset).format('LT');
            
            team_probable_pitcher = isHomeTeam ? todaysGame.gameData.home_probable_pitcher : todaysGame.gameData.away_probable_pitcher;
            opp_probable_pitcher  = isHomeTeam ? todaysGame.gameData.away_probable_pitcher : todaysGame.gameData.home_probable_pitcher;

            $("#teamProbables .pitcher_name").html(team_probable_pitcher.first + ' ' + team_probable_pitcher.last);
            $("#teamProbables .pitcher_info").html('ERA: '+team_probable_pitcher.era + ' (' + team_probable_pitcher.wins + '-' + team_probable_pitcher.losses + ')');

            $("#oppProbables .pitcher_name").html(opp_probable_pitcher.first + ' ' + opp_probable_pitcher.last);
            $("#oppProbables .pitcher_info").html('ERA: '+opp_probable_pitcher.era + ' (' + opp_probable_pitcher.wins + '-' + opp_probable_pitcher.losses + ')');
            



        }
        else
        { 
            team_score = isHomeTeam ? todaysGame.gameData.home_team_runs : todaysGame.gameData.away_team_runs;
            opp_score  = isHomeTeam ? todaysGame.gameData.away_team_runs : todaysGame.gameData.home_team_runs;

            if ( todaysGame.gameData.status == "In Progress" )
            {
                gametime_title = todaysGame.gameData.inning_state;
                gametime = todaysGame.gameData.inning;
            }
            else if ( todaysGame.gameData.status == "Final" )
            {
                if ( isHomeTeam )
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

                $("#teamScore h1").html(team_score);
                $("#oppScore h1").html(opp_score);
            }
        }

        $("#dayof-gametime-title").html(gametime_title);
        $("#dayof-gametime h3").html(gametime);

    }
    else
    {
        console.log('no game today');
    }


    var nextGame = scheduleData.next_game || false;
    var previousGame = scheduleData.previous_game || {};

    $("#nextgame_time h4").html(moment(nextGame.start).add('hours', timezoneOffset).format('LT'));


    $("#teamName h3").html(team_name);
    $("#teamCity").html(team_city);

    $("#oppName h3").html(opp_name);
    $("#oppCity").html(opp_city);

    $("#oppName h3").html(opp_name);

    $("#gameLocation").html(location_info);

    loadUpcomingGames();

}
    

var loadUpcomingGames = function(days) {
    console.log('loadUpcomingGames');
    var days = days || '5',
        format = 'html'
        ;

    $.ajax({
        dataType: "html",
        url: '/schedule/upcoming',
        data: {
            'd' : days,
            'f' : format
        },
        success: function(data) {
            if ( data )
            {
                if ( data.error )
                {
                    console.log('Error: ' + data.error);
                }
                else 
                {
                   // console.log('nextgamesData: ', data);
                    
                    $('#upcoming').html(data);
                }
            }
        },
        failure : function(data) {
            console.log('error loading page: ' + data);
        }
    });
}

initSchedule();


