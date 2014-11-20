
var http        = require('http');
var PageGlobals = require('./pageglobals');

var globals         = new PageGlobals();
var global_defaults = globals.getvalues();

var options = {
  host: global_defaults.host,
  port: 80,
  path: ''
};

var Versions = {

    'list': function (req, res) {
        options.path = global_defaults.api_uri + "/versions/" + req.params[0];

        http.get(options, function(getres) {
            // console.log('debug list versions status code = ' + getres.statusCode);
            var get_data = '';
            getres.on('data', function (chunk) {
                get_data += chunk;
            });

            getres.on('end', function() {
                var obj = JSON.parse(get_data);
             if ( getres.statusCode < 300 ) {
                var data = {
                    pagetitle:              'Versions for ' + obj.title,
                    current_post_id:        obj.post_id,
                    current_uri_title:      obj.uri_title,
                    current_title:          obj.title,
                    current_version:        obj.version,
                    current_author_name:    obj.author_name,
                    current_modified_date:  obj.formatted_modified_date,
                    current_modified_time:  obj.formatted_modified_time,
                    current_edit_reason:    obj.edit_reason,
                    version_list:           obj.version_list,
                    default_values:         globals.getvalues()
                };
                res.render('versions', data);
              } else {
                var data = {
                    pagetitle: 'Error',
                    user_message:   obj.user_message,
                    system_message: obj.system_message
                };  
                res.render('error', data);
              }
            });
        }).on('error', function(e) {
            getres.send('Could not retrieve post.');
        });
    },

    'compare': function (req, res) {

    }

};

module.exports = Versions;
