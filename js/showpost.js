
var http    = require('http');
var PageGlobals = require('./pageglobals');

var globals     = new PageGlobals();
var global_defaults = globals.getvalues();

var options = {
  host: global_defaults.host,
  port: 80,
  path: ''
};


var Post = {

    'show': function (req, res) {
        var viewing_old_version = false;
        if ( isNaN(req.params[0]) && req.params[0] == 'post' ) {
            options.path = global_defaults.api_uri + "/posts/" + req.params[1];
        } else {
            options.path = global_defaults.api_uri + "/posts/" + req.params[0];
        }

        http.get(options, function(getres) {
            var get_data = '';
            getres.on('data', function (chunk) {
                get_data += chunk;
            });

            getres.on('end', function() {
                var obj = JSON.parse(get_data);
             if ( getres.statusCode < 300 ) {
                if ( obj.parent_id > 0 ) {
                    viewing_old_version = true;
                } 
                var data = {
                    post_id:                  obj.post_id,
                    parent_id:                obj.parent_id,
                    viewing_old_version:      viewing_old_version,
                    pagetitle:                obj.title,
                    title:                    obj.post_type != 'note' ? obj.title : "",
                    uri_title:                obj.uri_title,
                    usinglargeimageheader:    obj.usinglargeimageheader,
                    largeimageheaderurl:      obj.largeimageheaderurl,
                    formatted_text:           obj.formatted_text,
                    author_name:              obj.author_name,
                    created_date:             obj.created_date,
                    modified_date:            obj.modified_date,
                    formatted_created_date:   obj.formatted_created_date,
                    formatted_modified_date:  obj.formatted_modified_date,
                    version:                  obj.version,
                    reader_is_author:         obj.reader_is_author,
                    word_count:               obj.word_count,
                    reading_time:             obj.reading_time,
                    related_posts_count:      obj.related_posts_count,
                    default_values: globals.getvalues()
                };
                res.render('post', data);
              } else {
                var data = {
                    pagetitle:      'Error',
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

module.exports = Post;
