
var http        = require('http');
var PageGlobals = require('./pageglobals');

var globals         = new PageGlobals();
var global_defaults = globals.getvalues();

var options = {
  host: global_defaults.host,
  port: 80,
  path: ''
};

var User = {

    'show': function (req, res) {
        if ( req.params[0] ) {
            options.path = global_defaults.api_uri + "/users/" + req.params[0];
        } else {
            res.send('Missing username');
        }
        
        http.get(options, function(getres) {
            // console.log('debug status code = ' + getres.statusCode);
            var get_data = '';
            getres.on('data', function (chunk) {
                get_data += chunk;
            });

            getres.on('end', function() {
                var obj = JSON.parse(get_data);
             if ( getres.statusCode < 300 ) {
                var data = {
                    pagetitle:       'Show User ' + obj.user_name,
                    profileusername: obj.user_name,
                    descformat:      obj.desc_format,
                    deleteduser:     false,
                    ownerloggedin:   false,
                    default_values:  globals.getvalues()
                };
                res.render('showuser', data);
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
            getres.send('Could not retrieve user info.');
        });
    }
};

module.exports = User;
