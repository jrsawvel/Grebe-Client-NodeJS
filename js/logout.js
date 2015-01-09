


var http    = require('http');
var PageGlobals = require('./pageglobals');

var globals     = new PageGlobals();
var global_defaults = globals.getvalues();

var UserCookies = require('./usercookies');
var user_cookies = new UserCookies();

var options = {
  host: global_defaults.host,
  port: global_defaults.api_port,
  path: ''
};


var Logout = {

    'logout': function (req, res) {
        var uc = user_cookies.getvalues(req);
        options.path = global_defaults.api_uri + "/users/" + uc.username + "/logout";
        options.path = options.path + '/?user_name=' + uc.username + '&user_id=' + uc.userid + '&session_id=' + uc.sessionid;

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
                 // res.cookie(global_defaults.cookie_prefix + 'userid',    0, {domain: global_defaults.cookie_host, path: '/', expires: '-10y'});
                 // res.cookie(global_defaults.cookie_prefix + 'username',  0, {domain: global_defaults.cookie_host, path: '/', expires: '-10y'});
                 // res.cookie(global_defaults.cookie_prefix + 'sessionid', 0, {domain: global_defaults.cookie_host, path: '/', expires: '-10y'});
                 // res.cookie(global_defaults.cookie_prefix + 'current',   0, {domain: global_defaults.cookie_host, path: '/', expires: '-10y'});

                 res.clearCookie(global_defaults.cookie_prefix + 'userid');
                 res.clearCookie(global_defaults.cookie_prefix + 'username');
                 res.clearCookie(global_defaults.cookie_prefix + 'sessionid');
                 res.clearCookie(global_defaults.cookie_prefix + 'current');
                 res.redirect(global_defaults.home_url);
              } else {
                var data = {
                    pagetitle: 'Error',
                    user_message:   obj.user_message,
                    system_message: obj.system_message,
                    default_values: default_values
                };  
                res.render('error', data);
              }
            });
        }).on('error', function(e) {
            getres.send('Could not retrieve source of post.');
        });
    }
};

module.exports = Logout;
