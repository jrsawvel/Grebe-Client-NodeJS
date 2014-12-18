
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

var RelatedPosts = {

    'list': function (req, res) {
        var uc = user_cookies.getvalues(req);

        options.path = global_defaults.api_uri + "/posts/" + req.params[0] + "/?related=yes";
        options.path = options.path + '&user_name=' + uc.username + '&user_id=' + uc.userid + '&session_id=' + uc.sessionid + '&text=html';

        http.get(options, function(getres) {
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
                    pagetitle:      'Related Posts for ' + obj.title,
                    post_id:        obj.post_id,
                    uri_title:      obj.uri_title,
                    title:          obj.title,
                    related_posts:  obj.related_posts_titles,
                    default_values: default_values
                };
                res.render('relatedposts', data);
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

module.exports = RelatedPosts;
