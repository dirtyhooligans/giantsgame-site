var scheduleData,
    timezones = {
        'PT' : -3,
        'CT' : -2,
        'MT' : -1,
        'ET' : 0
    } // EST to PST
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
            isHomeTeam = scheduleData.day_of.teamIsHome,
            team_name  = isHomeTeam ? todaysGame.gameData.home_team_name : todaysGame.gameData.away_team_name,
            team_city  = isHomeTeam ? todaysGame.gameData.home_team_city : todaysGame.gameData.away_team_city,
            opp_name   = isHomeTeam ? todaysGame.gameData.away_team_name : todaysGame.gameData.home_team_name,
            opp_city   = isHomeTeam ? todaysGame.gameData.away_team_city : todaysGame.gameData.home_team_city,
            team_wins  = isHomeTeam ? todaysGame.gameData.home_win  : todaysGame.gameData.away_win,
            team_loss  = isHomeTeam ? todaysGame.gameData.home_loss : todaysGame.gameData.away_loss,
            opp_wins   = isHomeTeam ? todaysGame.gameData.away_win  : todaysGame.gameData.home_win,
            opp_loss   = isHomeTeam ? todaysGame.gameData.away_loss : todaysGame.gameData.home_loss,

            team_timezone = isHomeTeam ? todaysGame.gameData.home_time_zone : todaysGame.gameData.away_time_zone,
 
            location_info = todaysGame.location,

            team_score,
            team_probables_pitcher,
            opp_probables_pitcher
            ;
            console.log(team_timezone);
        if ( todaysGame.gameData.status == "Preview" || todaysGame.gameData.status == "Pre-Game" )
        {
            //gametime_title = todaysGame.;
            gametime = moment(todaysGame.start).add('hours', timezones[team_timezone]).format('LT');
            
            team_probable_pitcher = isHomeTeam ? todaysGame.gameData.home_probable_pitcher : todaysGame.gameData.away_probable_pitcher;
            opp_probable_pitcher  = isHomeTeam ? todaysGame.gameData.away_probable_pitcher : todaysGame.gameData.home_probable_pitcher;

            $("#teamProbables .pitcher_name").html(team_probable_pitcher.first + ' ' + team_probable_pitcher.last);
            $("#teamProbables .pitcher_info").html('ERA: '+team_probable_pitcher.era + ' (' + team_probable_pitcher.wins + '-' + team_probable_pitcher.losses + ')');

            $("#oppProbables .pitcher_name").html(opp_probable_pitcher.first + ' ' + opp_probable_pitcher.last);
            $("#oppProbables .pitcher_info").html('ERA: '+opp_probable_pitcher.era + ' (' + opp_probable_pitcher.wins + '-' + opp_probable_pitcher.losses + ')');
            
            $(".team-record").html('(' + team_wins + ' - ' + team_loss + ')');
            $(".opp-record").html('(' + opp_wins + ' - ' + opp_loss + ')');

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
            else if ( todaysGame.gameData.status == "Final" || todaysGame.gameData.status == "Game Over" )
            {
                if ( team_score > opp_score )
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
            $(".team-score").html(team_score);
            $(".opp-score").html(opp_score);
        }

        $("#dayof-gametime-title").html(gametime_title);
        $(".game-time").html(gametime);

    }
    else
    {
        console.log('no game today');
    }


    var nextGame = scheduleData.next_game || false,
        nextgame_team_timezone
        ;
    var previousGame = scheduleData.previous_game || {};


    if ( nextGame )
    {
        nextgame_team_timezone = nextGame.teamIsHome ? nextGame.gameData.home_time_zone : nextGame.gameData.away_time_zone;
console.log(nextgame_team_timezone);
        $("#nextgame_time h4").html(moment(nextGame.start).add('hours', timezones[nextgame_team_timezone]).format('LT'));

    }
    

    $(".team-name").html(team_name);
    $(".team-city").html(team_city);

    $(".opp-name").html(opp_name);
    $(".opp-city").html(opp_city);

    $(".opp-name").html(opp_name);

    $(".game-location").html(location_info);

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


