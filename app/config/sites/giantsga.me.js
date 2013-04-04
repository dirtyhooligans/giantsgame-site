module.exports = {
    name : 'GiantsGa.me',
    description : 'Are the San Francisco Giants playing today?',
    team : {
        name : 'Giants',
        city : 'San Francisco',
        favicon : 'sf.ico',
        logo : {
            header : 'images/sf.png'
        }
    },
    schedule : {
        full : 'http://mlb.mlb.com/soa/ical/schedule.ics?team_id=137&season=2013',
        home : 'http://mlb.mlb.com/soa/ical/schedule.ics?home_team_id=137&season=2013',
        away : 'http://mlb.mlb.com/soa/ical/schedule.ics?away_team_id=137&season=2013'
    },
    mlb : {
        id : '137',
        code : 'sfn',
        url : 'http://sanfrancisco.giants.mlb.com/'
    },
}