module.exports = {
    info : {
        name        : 'BaseballGa.me',
        tagline     : 'is there a baseball game today?',
        description : 'a simple site to quickly check if there is a baseball game today for a specific team.',
        port        : 8080,
        cookieKey   : 'keyboard cat',
        salt        : 'more keyboard cat!'
    },

    ui : {
        
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
