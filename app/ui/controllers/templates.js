var fs     = require('fs'),
    jade   = require('jade'),
    async  = require('async'),
    config = require('../../config'),
    logger = require('../../lib/logger'),
    errors = require('../../lib/errors')
    ;

module.exports = {

    getTemplate : function(name, data, callback)
    {
        var fileName = __dirname + '/../../ui/views/' + name + '.jade',
            context  = JSON.parse(JSON.stringify(data))
            ;
        //console.log('context: ', context);

        fs.readFile(fileName, 'utf8', function(err, template)
        {
            if(err)
            {
                if(err.code === 'ENOENT')
                    err = new errors.SystemError('TEMPLATE_NOT_FOUND');

                callback(err, null);
            }
            else
            {
                template = jade.compile(template, { filename : fileName });
                callback(err, template(context));
                
            }
        });
    }
};
