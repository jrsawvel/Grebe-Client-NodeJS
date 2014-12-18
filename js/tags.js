
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

var Tags = {

    'tags': function (req, res) {
        var uc = user_cookies.getvalues(req);
        if ( req.params[0] && req.params[0] == 'count' ) {
            options.path = global_defaults.api_uri + "/tags/?sortby=count";
        } else {
            options.path = global_defaults.api_uri + "/tags/?sortby=name";
        }
        
        options.path = options.path + '&user_name=' + uc.username + '&user_id=' + uc.userid + '&session_id=' + uc.sessionid + '&text=html';

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

                var data = {
                    pagetitle:      'Tags',
                    tag_list:       obj.tag_list,
                    default_values: default_values
                };
                res.render('tags', data);
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
            getres.send('Could not retrieve post.');
        });
    }
};

module.exports = Tags;
