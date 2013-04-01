var env = (process.env.NODE_ENV = process.env.NODE_ENV || 'development');
var config = require('./' + env);


    // config.modifyByHost = function(host){
    //     var host_id,
    //         host_config
    //         ;
    //     host_id = host.split('.').length > 2 ? host.split('.').slice(host.split('.').length-2).join('.') : host; 

    //     console.log(host_id);
        
    //     if ( host_config = require('./sites/' + host_id ) )
    //     {
    //         //console.log(host_config);
    //         for ( node in host_config ) {
    //             //console.log(node + ' : ', host_config);
    //             console[node] = host_config[node];
    //         }

    //         if ( host_config.name ) {
    //             config.info.name = host_config.name;
    //         }
    //     }
    //     else
    //     {
    //         console.log('unable to find config for host: ' + host_id);
    //     }

    // }

module.exports = config;

