$(document).ready(function(){
    
    function route(name, url)
    {
        Finch.route(url || name, function()
        {
            Finch.observe(function(params)
            {
                if ( name == 'home' )
                    Finch.navigate('today');

                console.log(params, url, name);
                loadPage(name);
            });
        });
    }

    $(document).on('ready', function()
    {
        Finch.listen();

        if(!window.location.hash)
            Finch.navigate('today');
    });

    route('home');
    route('today');
    route('tomorrow');
    route('yesterday');
    route('schedule');
    route('about');
    
    app.navigate = function(url)
    {
        Finch.navigate(url);
        // reset scroll position
        window.scrollTo(0, 0);
        // clear the tooltip
        //app.tooltip();
    };

    params = function() {};
});
