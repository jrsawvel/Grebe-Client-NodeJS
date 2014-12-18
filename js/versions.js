
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

var Versions = {

    'list': function (req, res) {
        var uc = user_cookies.getvalues(req);

        options.path = global_defaults.api_uri + "/versions/" + req.params[0];

        options.path = options.path + '/?user_name=' + uc.username + '&user_id=' + uc.userid + '&session_id=' + uc.sessionid + '&text=html';

        http.get(options, function(getres) {
            // console.log('debug list versions status code = ' + getres.statusCode);
            var get_data = '';
            getres.on('data', function (chunk) {
                get_data += chunk;
            });

            getres.on('end', function() {
                var obj = JSON.parse(get_data);

                var default_values = globals.getvalues();
                default_values.user_cookies = uc;

             if ( getres.statusCode < 300 ) {
                if ( obj.version_list.length > 0 ) {
                    obj.version_list[0].checked = 'checked=\"checked\"';
                }

                var data = {
                    pagetitle:              'Versions for ' + obj.title,
                    current_post_id:        obj.post_id,
                    current_uri_title:      obj.uri_title,
                    current_title:          obj.title,
                    current_version:        obj.version,
                    current_author_name:    obj.author_name,
                    current_modified_date:  obj.formatted_modified_date,
                    current_modified_time:  obj.formatted_modified_time,
                    current_edit_reason:    obj.edit_reason,
                    version_list:           obj.version_list,
                    default_values:         default_values
                };
                res.render('versions', data);
              } else {
                var data = {
                    pagetitle: 'Error',
                    user_message:   obj.user_message,
                    system_message: obj.system_message,
                    default_values:         default_values
                };  
                res.render('error', data);
              }
            });
        }).on('error', function(e) {
            getres.send('Could not retrieve post.');
        });
    },

    'compare': function (req, res) {

        var uc = user_cookies.getvalues(req);

        var leftid = 0;
        var rightid = 0;

        if ( req.param('leftid') ) {
            leftid = req.param('leftid');
        }

        if ( req.param('rightid') ) {
            rightid = req.param('rightid');
        }

        options.path = global_defaults.api_uri + "/versions/" + leftid + "/" + rightid;
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
                    var data = {
                        pagetitle:              'Comparing versions for IDs ' + leftid + ' and ' + rightid,
                        title:                  obj.top_version.title,
                        post_id:                obj.top_version.post_id,
                        uri_title:              obj.top_version.uri_title,
                        left_version:           obj.version_data.left_version,
                        left_post_id:           obj.version_data.left_post_id,
                        left_uri_title:         obj.version_data.left_uri_title,
                        left_date:              obj.version_data.left_date,
                        left_time:              obj.version_data.left_time,
                        right_version:          obj.version_data.right_version,
                        right_post_id:          obj.version_data.right_post_id,
                        right_uri_title:        obj.version_data.right_uri_title,
                        right_date:             obj.version_data.right_date,
                        right_time:             obj.version_data.right_time,
                        compare_loop:           obj.compare_results,
                        default_values:         default_values
                    };
                    res.render('compare', data);
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

    },

};

module.exports = Versions;
