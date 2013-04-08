module.exports = {
    name : 'BaseballGa.me',
    description : 'Is there a baseball game today?',
    team : {
        favicon : 'la.ico',
        logo : {
            header : 'images/la.png'
        }
    },
    schedule : {
        full : 'http://mlb.mlb.com/soa/ical/schedule.ics?team_id=119&season=2013',
        home : 'http://mlb.mlb.com/soa/ical/schedule.ics?home_team_id=119&season=2013',
        away : 'http://mlb.mlb.com/soa/ical/schedule.ics?away_team_id=119&season=2013'
    },
    mlb : {
        id : '119',
        code : 'lan',
        url : 'http://losangeles.dodgers.mlb.com/'
    }
}