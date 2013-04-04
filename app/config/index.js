var env = (process.env.NODE_ENV = process.env.NODE_ENV || 'development');
var config = require('./' + env);

function merge(obj1, obj2) {

  for (var p in obj2) {
    try {
      // Property in destination object set; update its value.
      if ('function' == typeof obj2[p]) continue;
      if ( obj2[p].constructor==Object ) {
        obj1[p] = merge(obj1[p], obj2[p]);

      } else {
        obj1[p] = obj2[p];

      }
    } catch(e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p];
    }
  }
  return obj1;
}

config.setSite = function(cfg, next){
    
    //console.log('set site config', cfg);
    
    config = merge(config, cfg);

    next();
} 
//console.log(global.site);

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

