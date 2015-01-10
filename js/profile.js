var http        = require('http');
var querystring = require('querystring');
var Entities    = require('html-entities').XmlEntities;

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

function show_error(req, res, user_msg, system_msg) {
    var default_values = globals.getvalues();
    var uc = user_cookies.getvalues(req);
    default_values.user_cookies = uc;
    var data = {
        pagetitle: 'Error',
        user_message:   user_msg,
        system_message: system_msg,
        default_values: default_values,
    };  
    res.render('error', data);
}

var Profile = {

    'settings': function (req, res) {
        var uc = user_cookies.getvalues(req);
        options.path = global_defaults.api_uri + "/users/" + uc.username;
        options.path = options.path + '/?user_name=' + uc.username + '&user_id=' + uc.userid + '&session_id=' + uc.sessionid;
        options.headers = '';
        options.method = 'GET';

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

                if ( (getres.statusCode < 300) && obj.user_id ) {
                    var data = {
                        pagetitle:       'Customize User Settings',
                        user_name:       obj.user_name,
                        user_id:         obj.user_id,
                        email:           obj.email,
                        desc_markup:     obj.desc_markup,
                        default_values:  default_values
                    };
                    res.render('settings', data);
                } else if ( getres.statusCode < 300 ) {
                    show_error(req, res, "Invalid request.", "Unable to complete action.");
                } else if ( getres.statusCode >= 400 && getres.statusCode < 500 ) {
                    if ( getres.statusCode == 401 ) {
                        var data = {
                            pagetitle:      'Login',
                            default_values: globals.getvalues(),
                        };
                        res.render('loginform', data);
                    } else {
                        show_error(req, res, obj.user_message, obj.system_message);
                    }
                } else {
                    show_error(req, req, "Unable to complete request.", "Invalid response code returned from API."); 
                }
            });
        }).on('error', function(e) {
            getres.send('Could not retrieve user info.');
        });
    },


    'update': function (req, res) {
        var uc = user_cookies.getvalues(req);
        var email       = req.param('email'); 
        var desc_markup = req.param('desc_markup'); 

        var entities = new Entities();
        var encoded_string = entities.encodeNonASCII(desc_markup); 

        var myobj = {
            email:        email,
            desc_markup:  desc_markup,
        };

        var json_str = JSON.stringify(myobj);

        var post_data = querystring.stringify({
            json:       json_str,
            user_name:  uc.username,
            user_id:    uc.userid,
            session_id: uc.sessionid,
        });

        var headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        };

        options.path = global_defaults.api_uri + "/users";
        options.headers = headers;
        options.method = 'PUT';

        var postreq = http.request(options, function(postres) {
            postres.setEncoding('utf8');

            var return_data = '';
            postres.on('data', function (chunk) {
                return_data += chunk;
            });

            postres.on('end', function() {
                var obj = JSON.parse(return_data);
                var default_values = globals.getvalues();
                default_values.user_cookies = uc;

                if ( postres.statusCode < 300 ) {
                    res.redirect(global_defaults.home_url + "/user/" + uc.username);
                } else if ( getres.statusCode >= 400 && getres.statusCode < 500 ) {
                    if ( getres.statusCode == 401 ) {
                        var data = {
                            pagetitle:      'Login',
                            default_values: globals.getvalues(),
                        };
                        res.render('loginform', data);
                    } else {
                        show_error(req, res, obj.user_message, obj.system_message);
                    }
                } else {
                    show_error(req, req, "Unable to complete request.", "Invalid response code returned from API."); 
                }
            });
        }).on('error', function(e) {
            getres.send('Could not retrieve user info.');
        });

        postreq.write(post_data);
        postreq.end();
    },

};

module.exports = Profile;
