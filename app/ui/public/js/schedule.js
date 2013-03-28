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
    var nextGame = scheduleData.day_after || scheduleData.next_game;

    $("#nextgame_time h4").html(moment(nextGame.start).add('hours', timezoneOffset).format('LT'));

    $("#dayof-gametime h3").html(moment(todaysGame.start).add('hours', timezoneOffset).format('LT'));
}

initSchedule();