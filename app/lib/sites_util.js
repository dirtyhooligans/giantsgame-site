var Sites = function() {
    this.hostDictionary = {};
};

Sites.prototype.config = function(cfg) {
    var hostDictionary = this.hostDictionary;

    return function config(req, res, next){
        console.log('config return', req.headers.host);
        if (!req.headers.host) return next();
        var host = req.headers.host.split(':')[0].replace('www.', '').replace('local.', '');
        var site = hostDictionary[host];
        if (!site) return next();
        //if ('function' == typeof server) return server(req, res, next);
        //server.emit('request', req, res);
        cfg.setSite(site, next);
    };

};

Sites.prototype.register = function(host, cfg) {
    this.hostDictionary[host] = cfg;
};

module.exports = new Sites();