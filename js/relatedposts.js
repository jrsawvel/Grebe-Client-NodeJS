
var http        = require('http');
var PageGlobals = require('./pageglobals');

var globals         = new PageGlobals();
var global_defaults = globals.getvalues();

var options = {
  host: global_defaults.host,
  port: 80,
  path: ''
};

var RelatedPosts = {

    'list': function (req, res) {
        options.path = global_defaults.api_uri + "/posts/" + req.params[0] + "/?related=yes";

        http.get(options, function(getres) {
            var get_data = '';
            getres.on('data', function (chunk) {
                get_data += chunk;
            });

            getres.on('end', function() {
                var obj = JSON.parse(get_data);
             if ( getres.statusCode < 300 ) {
                var data = {
                    pagetitle:      'Related Posts for ' + obj.title,
                    post_id:        obj.post_id,
                    uri_title:      obj.uri_title,
                    title:          obj.title,
                    related_posts:  obj.related_posts_titles,
                    default_values: globals.getvalues()
                };
                res.render('relatedposts', data);
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
    }
};

module.exports = RelatedPosts;
