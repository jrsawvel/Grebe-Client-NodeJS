
var http        = require('http');
var querystring = require('querystring');

var PageGlobals = require('./pageglobals');

var globals         = new PageGlobals();
var global_defaults = globals.getvalues();

var options = {
  host: global_defaults.host,
  port: global_defaults.api_port,
  path: '',
  method: 'POST',
  headers: ''
};

function show_error(res, user_msg, system_msg) {
    var data = {
        pagetitle: 'Error',
        user_message:   user_msg,
        system_message: system_msg
    };  
    res.render('error', data);
}

var Login = {

    'form': function (req, res) {
        var data = {
            pagetitle: 'Login Form',
            default_values: globals.getvalues()
        };
        res.render('loginform', data);
    },

    'nopwdlogin': function (req, res) {
        var myobj = {
            user_digest:     req.params[0],
            password_digest: req.params[1]
        };
        var json_str =  JSON.stringify(myobj);

        var post_data = querystring.stringify({
            json: json_str
        });

        var headers = {
            'Content-Type':   'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        };

        options.path = global_defaults.api_uri + "/users/nopwdlogin";
        options.headers = headers;

            var h_req = http.request(options, function(h_res) {
                h_res.setEncoding('utf-8');

                var response_string = '';

                h_res.on('data', function (h_data) {
                    response_string += h_data;
                });

                h_res.on('end', function() {
                    var obj = JSON.parse(response_string);
                    if ( h_res.statusCode < 300 ) {
                        // var debug_str = 'user_id=' + obj.user_id + ' user_name=' + obj.user_name + ' session_id=' + obj.session_id;
                        // show_error(res, "debug", debug_str);
                        res.cookie(global_defaults.cookie_prefix + 'userid',    obj.user_id,    {domain: global_defaults.cookie_host, path: '/'});
                        res.cookie(global_defaults.cookie_prefix + 'username',  obj.user_name,  {domain: global_defaults.cookie_host, path: '/'});
                        res.cookie(global_defaults.cookie_prefix + 'sessionid', obj.session_id, {domain: global_defaults.cookie_host, path: '/'});
                        res.cookie(global_defaults.cookie_prefix + 'current',   '1',            {domain: global_defaults.cookie_host, path: '/'});
                        res.redirect(global_defaults.home_url);
                    } else {
                        show_error(res, obj.user_message, obj.system_message);
                    }
                });
            });

            h_req.on('error', function(e) {
                show_error(res, "Unknown problem.", "Could not retrieve data.");
            });

            h_req.write(post_data);
            h_req.end();
    },

    'login': function (req, res) {
        if ( req.param('username').trim() && req.param('email').trim() ) {

            var myobj = {
                user_name:  req.param('username').trim(),
                email:      req.param('email').trim(),
                client_url: global_defaults.home_url
            };
            var json_str =  JSON.stringify(myobj);

            var post_data = querystring.stringify({
                json: json_str
            });
            
            var headers = {
                'Content-Type':   'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            };

            options.path = global_defaults.api_uri + "/users/password";
            options.headers = headers;
            
            var h_req = http.request(options, function(h_res) {
                h_res.setEncoding('utf-8');

                var response_string = '';

                h_res.on('data', function (h_data) {
                    response_string += h_data;
                });

                h_res.on('end', function() {
                    var obj = JSON.parse(response_string);
                    if ( h_res.statusCode < 300 ) {
                        var data = {
                            pagetitle: 'New Login Link',
                            default_values: globals.getvalues()
                        };
                        res.render('newloginlink', data);
                    } else {
                        show_error(res, obj.user_message, obj.system_message);
                    }
                });
            });

            h_req.on('error', function(e) {
                show_error(res, "Unknown problem.", "Could not retrieve data.");
            });

            h_req.write(post_data);
            h_req.end();
        } else {
            show_error(res, 'Invalid data.', 'Username and/or email are missing.');
        }
    }

};

module.exports = Login;
