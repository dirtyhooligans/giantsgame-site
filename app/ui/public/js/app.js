var app = {};

$(document).ready(function(){

    //loadPage('home');

});

var debugObj;

function loadPage(page, data) {
    console.log('load page: ' + page);
    $.ajax({
        dataType: "json",
        url: '/' + page,
        data: data,
        success: function(data) {
            console.log(data);
            debugObj = data;
            $('#page').html(data.display);
            
        },
        failure : function(data) {
            console.log('error loading page: ' + data);
        }
    });
}