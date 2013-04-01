var app = {};

$(document).ready(function(){

    //loadPage('home');

});

var pageData = {};

function loadPage(page, data) {
    var p,
        d = data || {}
        ;

    switch (page) {
        case "today" : 
            p = "schedule";
            d.day = "today";
            break;
        case "tomorrow" : 
            p = "schedule";
            d.day = "tomorrow";
            break;
        case "yesterday" : 
            p = "schedule";
            d.day = "yesterday";
            break;
        default :
            p = page;
            break;
    }

    console.log('load page: ' + p + ' data: ', d);
    $.ajax({
        dataType: "json",
        url: '/' + p,
        data: d,
        success: function(data) {
            if ( data )
            {
                if ( data.error )
                {
                    console.log('Error: ' + data.error);
                }
                else 
                {
                    console.log('pageData: ', data);
                    pageData = data;
                    $('#page').html(data.display);
                }
            }
        },
        failure : function(data) {
            console.log('error loading page: ' + data);
        }
    });
}