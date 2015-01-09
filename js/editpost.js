var http        = require('http');
var querystring = require('querystring');

var Entities = require('html-entities').XmlEntities;

var PageGlobals = require('./pageglobals');
var globals         = new PageGlobals();
var global_defaults = globals.getvalues();

var UserCookies = require('./usercookies');
var user_cookies = new UserCookies();

var options = {
  host: global_defaults.host,
  port: global_defaults.api_port,
  path: '',
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

var EditPost = {

    'getpost': function (req, res) {

        var uc = user_cookies.getvalues(req);
        var viewing_old_version = false;

        options.path = global_defaults.api_uri + "/posts/" + req.params[1];

        options.path = options.path + '/?user_name=' + uc.username + '&user_id=' + uc.userid + '&session_id=' + uc.sessionid + '&text=full';

        options.headers = '';
        options.method = 'GET';

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

                var entities = new Entities();

                var data = {
                    parent_id:                obj.parent_id,
                    viewing_old_version:      viewing_old_version,
                    version_number:           obj.version,
                    uri_title:                obj.uri_title,
                    title:                    obj.post_type != 'note' ? obj.title : "",
                    pagetitle:                'Editing ' + obj.title,
                    markup_text:              entities.decode(obj.markup_text),
                    post_id:                  obj.post_id,
                    post_digest:              obj.post_digest,
                    default_values: default_values
                };
                res.render('editpostform', data);
              } else {
                show_error(req, res, obj.user_message, obj.system_message);
              }
            });
        }).on('error', function(e) {
            getres.send('Could not retrieve post.');
        });
    },

    'update': function (req, res) {
        var uc = user_cookies.getvalues(req);

        if ( req.param('markup_text').trim() ) {
            var post_id     = req.param('post_id'); 
            var post_digest = req.param('post_digest'); 
            var post_text   = req.param('markup_text').trim();
            var edit_reason = req.param('edit_reason');
            var submit_type = req.param('sb'); 

            var entities = new Entities();
            var encoded_string = entities.encodeNonASCII(post_text); 

            if ( edit_reason ) {
                edit_reason = edit_reason.trim();
                edit_reason = entities.encodeNonASCII(edit_reason);
            }

            var myobj = {
                post_text:   encoded_string,
                submit_type: submit_type,
                post_id:     post_id,
                post_digest: post_digest,
                edit_reason: edit_reason,
            };
            var json_str =  JSON.stringify(myobj);

            var post_data = querystring.stringify({
                json:       json_str,
                user_name:  uc.username,
                user_id:    uc.userid,
                session_id: uc.sessionid,
            });
            
            var headers = {
                'Content-Type':   'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            };

            options.path = global_defaults.api_uri + "/posts";
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
                        if ( submit_type == "Update" ) {
                            res.redirect(global_defaults.home_url + "/" + obj.post_id + "/writetemplate");
                        } else if ( submit_type == "Preview" ) {
                            var preview_title = '';
                            if ( obj.post_type == "article" ) {
                                preview_title = obj.title;
                            }

                            var data = {
                                pagetitle:            'Editing ' + obj.title,
                                formatted_text:       obj.formatted_text,
                                markup_text:          post_text,
                                viewing_old_version:  obj.parent_id,
                                version_number:       obj.version,
                                post_digest:          obj.post_digest,
                                uri_title:            obj.uri_title,
                                post_id:              obj.post_id,
                                edit_reason:          obj.edit_reason,
                                title:                preview_title,
                                default_values:       default_values
                            };
                            res.render('editpostform', data);
                        }
                    } else {
                        show_error(req, res, obj.user_message, obj.system_message);                
                    }
                });
            }).on('error', function(e) {
                res.send('Could not retrieve source of post.');
            });

            postreq.write(post_data);
            postreq.end();
        } // end if markup exists
    }
};

module.exports = EditPost;
