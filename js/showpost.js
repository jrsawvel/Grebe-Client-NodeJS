
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

function _create_table_of_contents (formatted_text) {
    var loop_data = [];
    var res = formatted_text.match(/<!-- header:([1-6]):(.*?) -->/mg);

    for (i=0; i<res.length; i++ ) {
        var headers   = [];
        var regex = /<!-- header:([1-6]):(.*?) -->/m; 
        if ( headers = regex.exec(res[i]) ) {
            for (j=0; j<headers.length; j+=3 ) {
            var hash = {     level: headers[j+1], 
                           toclink: headers[j+2],
                        cleantitle: _clean_title(headers[j+2])
                       };
            }
            loop_data.push(hash);
        }
    }
    return loop_data;
}

function _clean_title (hstr) {
   hstr = hstr.replace(/[-]/g,  "");
   hstr = hstr.replace(/[ ]/g,  "-");
   hstr = hstr.replace(/[:]/g,  "-");
   hstr = hstr.replace(/--/g,   "-");
   // only use alphanumeric, underscore, and dash in friendly link url
   hstr = hstr.replace(/[^\w-]+/g,   "");
   return hstr;
}

var Post = {

    'show': function (req, res) {

        var uc = user_cookies.getvalues(req);

        var viewing_old_version = false;
        if ( isNaN(req.params[0]) && req.params[0] == 'post' ) {
            options.path = global_defaults.api_uri + "/posts/" + req.params[1];
        } else {
            options.path = global_defaults.api_uri + "/posts/" + req.params[0];
        }

        options.path = options.path + '/?user_name=' + uc.username + '&user_id=' + uc.userid + '&session_id=' + uc.sessionid + '&text=html';

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
                if ( obj.parent_id > 0 ) {
                    viewing_old_version = true;
                } 
                var modified = false;
                if ( obj.version > 1 ) {
                    modified = true;
                }

                obj.usingtoc = 0;
                var toc_loop = [{}];
                if ( obj.table_of_contents ) {
                    toc_loop = _create_table_of_contents(obj.formatted_text);
                    obj.usingtoc = 1; 
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
                    usingimageheader:         obj.usingimageheader,
                    imageheaderurl:           obj.imageheaderurl,
                    formatted_text:           obj.formatted_text,
                    author_name:              obj.author_name,
                    created_date:             obj.created_date,
                    modified_date:            obj.modified_date,
                    formatted_created_date:   obj.formatted_created_date,
                    formatted_modified_date:  obj.formatted_modified_date,
                    modified:                 modified,
                    version:                  obj.version,
                    reader_is_author:         obj.reader_is_author,
                    word_count:               obj.word_count,
                    reading_time:             obj.reading_time,
                    related_posts_count:      obj.related_posts_count,
                    usingtoc:                 obj.usingtoc,
                    toc_loop:                 toc_loop,
                    default_values: default_values
                };
                res.render('post', data);
              } else {
                var data = {
                    pagetitle:      'Error',
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

module.exports = Post;
