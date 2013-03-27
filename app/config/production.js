module.exports = {
    info : {
        name        : 'GaintsGa.me',
        tagline     : 'a simple site to check if the giants are playing or not',
        description : '',
        port        : 3000,
        cookieKey   : 'keyboard cat',
        salt        : 'more keyboard cat!'
    },

    ui : {
        
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
