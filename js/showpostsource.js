
var http    = require('http');
var PageGlobals = require('./pageglobals');

var globals     = new PageGlobals();
var global_defaults = globals.getvalues();

var options = {
  host: global_defaults.host,
  port: 80,
  path: ''
};


var Source = {

    'show': function (req, res) {
        if ( !isNaN(req.params[1]) && req.params[0] == 'source' ) {
            options.path = global_defaults.api_uri + "/posts/" + req.params[1] + "/?text=markup";
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
                    pagetitle:     'Markup source for ' + obj.title,
                    markup_text:   obj.markup_text,
                };
                res.setHeader("Content-Type", "text/plain");
                res.render('source', data);
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
            getres.send('Could not retrieve source of post.');
        });
    }
};

module.exports = Source;
