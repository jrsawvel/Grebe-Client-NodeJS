
var http        = require('http');
var PageGlobals = require('./pageglobals');

var globals         = new PageGlobals();
var global_defaults = globals.getvalues();

var UserCookies = require('./usercookies');
var user_cookies = new UserCookies();

var options = {
  host: global_defaults.host,
  port: global_defaults.api_port,
  path: ''
};

var User = {

    'show': function (req, res) {
        var uc = user_cookies.getvalues(req);

        if ( req.params[0] ) {
            options.path = global_defaults.api_uri + "/users/" + req.params[0];
        } else {
            res.send('Missing username');
        }
        
        options.path = options.path + '/?user_name=' + uc.username + '&user_id=' + uc.userid + '&session_id=' + uc.sessionid + '&text=html';

        http.get(options, function(getres) {
            // console.log('debug status code = ' + getres.statusCode);
            var get_data = '';
            getres.on('data', function (chunk) {
                get_data += chunk;
            });

            getres.on('end', function() {
                var obj = JSON.parse(get_data);

                var default_values = globals.getvalues();
                default_values.user_cookies = uc;

             if ( getres.statusCode < 300 ) {

                var ownerloggedin = 0;

                if (typeof uc.username !== 'undefined') {
                    // uc.username is defined
                    var user1 = uc.username.toLowerCase();
                    var user2 = req.params[0].toLowerCase();
                    if ( !user1.localeCompare(user2) )  {
                        // strings match when localCompare returns 0
                        ownerloggedin = 1;
                    }
                }

                var data = {
                    pagetitle:       'Show User ' + obj.user_name,
                    profileusername: obj.user_name,
                    descformat:      obj.desc_format,
                    deleteduser:     false,
                    ownerloggedin:   ownerloggedin,
                    default_values:  default_values
                };
                res.render('showuser', data);
              } else {
                var data = {
                    pagetitle: 'Error',
                    user_message:   obj.user_message,
                    system_message: obj.system_message,
                    default_values:  default_values
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
