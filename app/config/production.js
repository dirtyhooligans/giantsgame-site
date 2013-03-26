module.exports = {
    info : {
        title       : 'GaintsGa.me',
        tagline     : 'root',
        description : '',
        port      : 8080,
        cookieKey : 'keyboard cat',
        salt      : 'more keyboard cat!',
        envbar    : 'lavender'
    },

    schedule : {
        full : 'http://mlb.mlb.com/soa/ical/schedule.ics?team_id=137&season=2013',
        home : 'http://mlb.mlb.com/soa/ical/schedule.ics?home_team_id=137&season=2013',
        away : 'http://mlb.mlb.com/soa/ical/schedule.ics?away_team_id=137&season=2013'
    },

    paths : {
        logs     : __dirname + '/../../logs/app.log'
    },

    worker : {
        instances : 10
    },

    session : {
        key : 'sid'
    }
};
