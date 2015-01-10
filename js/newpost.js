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

var NewPost = {

    'newpostform': function (req, res) {
        var uc = user_cookies.getvalues(req);
        options.path = global_defaults.api_uri + "/users/" + uc.username;
        options.path = options.path + '/?user_name=' + uc.username + '&user_id=' + uc.userid + '&session_id=' + uc.sessionid; 
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
 
             if ( getres.statusCode < 300 && obj.hasOwnProperty('user_digest') ) {
                 var data = {
                     pagetitle: 'Compose New Post',
                     default_values: default_values,
                 };
                 res.render('newpostform', data);
              } else {
                  var data = {
                      pagetitle: 'Login Form',
                      default_values: globals.getvalues()
                  };
                  res.render('loginform', data);
              }
            });
        }).on('error', function(e) {
            res.send('Could not retrieve post.');
        });
    },

    'splitscreen': function (req, res) {
        var uc = user_cookies.getvalues(req);
        options.path = global_defaults.api_uri + "/users/" + uc.username;
        options.path = options.path + '/?user_name=' + uc.username + '&user_id=' + uc.userid + '&session_id=' + uc.sessionid; 
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
 
             if ( getres.statusCode < 300 && obj.hasOwnProperty('user_digest') ) {
                 var data = {
                     pagetitle: 'Creating Post - Split Screen',
                     action: 'addarticle',
                     api_url: 'http://' + global_defaults.host +  global_defaults.api_uri,
                     post_id: 0,
                     post_digest: 'undef',  
                     default_values: default_values,
                 };
                 res.render('splitscreenform', data);
              } else {
                  var data = {
                      pagetitle: 'Login Form',
                      default_values: globals.getvalues()
                  };
                  res.render('loginform', data);
              }
            });
        }).on('error', function(e) {
            res.send('Could not retrieve post.');
        });
    },

    'create': function (req, res) {
        var uc = user_cookies.getvalues(req);

        if ( req.param('markup_content').trim() ) {
            var submit_type = req.param('sb'); 
            var post_text = req.param('markup_content').trim();

            var entities = new Entities();
//            var encoded_string = entities.encodeNonUTF(post_text); 
            var encoded_string = entities.encodeNonASCII(post_text); 

            var post_location = '';
            if ( req.param('post_location') ) {
                post_location = req.param('post_location');
            }
           
            var myobj = {
                post_text:   encoded_string,
                submit_type: submit_type,
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
            options.method = 'POST';
   
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
                        if ( submit_type == "Post" ) {
                            if ( post_location == "notes_stream" )  {
                                res.redirect('back');
                            } else {                        
                                res.redirect(global_defaults.home_url + "/" + obj.post_id + "/writetemplate");
                                // show_error(req, res, "debug", "new post successful, i think");
                            }
                        } else if ( submit_type == "Preview" ) {
                            var is_article = 0;
                            var preview_title = '';
                            if ( obj.post_type == "article" ) {
                                is_article = 1;
                                preview_title = obj.title;
                            }

                            var data = {
                                pagetitle:       'Previewing new post ' + obj.title,
                                post_text:       post_text,
                                previewingpost:  1,
                                formatted_text:  obj.formatted_text,
                                is_article:      is_article,                                                                
                                preview_title:   preview_title,
                            };
                            res.render('newpostform', data);
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

module.exports = NewPost;
