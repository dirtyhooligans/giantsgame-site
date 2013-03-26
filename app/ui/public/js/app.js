$(document).ready(function(){

    loadPage('home');

});

function loadPage(page, data) {
    console.log('load page: ' + page);
    $.ajax({
        dataType: "json",
        url: '/' + page,
        data: data,
        success: function(data) {
            console.log(data);
            
            $('#page').html(data.display);
            
        },
        failure : function(data) {
            console.log('error loading page: ' + data);
        }
    });
}