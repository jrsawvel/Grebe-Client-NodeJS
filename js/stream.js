
var http        = require('http');
var PageGlobals = require('./pageglobals');

var globals         = new PageGlobals();
var global_defaults = globals.getvalues();

var options = {
  host: global_defaults.host,
  port: 80,
  path: ''
};


function show_stream (template, res, data) {
    res.render(template, data);
}

var Stream = {

    'homepage': function (req, res) {
        var page_num = 1;
        options.path = global_defaults.api_uri + "/posts";
        if ( req.params[0] && !isNaN(req.params[0]) ) {
            page_num = req.params[0] > 0 ? parseInt(req.params[0]) : 1;
            options.path = options.path + "/?page=" + page_num;
        }

        http.get(options, function(getres) {
            var get_data = '';
            getres.on('data', function (chunk) {
                get_data += chunk;
            });

            getres.on('end', function() {
              var obj = JSON.parse(get_data);
              if ( getres.statusCode < 300 ) {
                var next_page_num = page_num + 1;
                var prev_page_num = page_num - 1;
                var data = {
                    background_image:   global_defaults.background_image,
                    blog_description:   global_defaults.site_description,
                    blog_title:         global_defaults.site_name,
                    pagetitle:          'Home Page',
                    stream:             obj.posts,
                    default_values:     globals.getvalues(),
                    not_last_page:      obj.next_link_bool ? 1 : 0,
                    not_page_one:       page_num==1 ? 0 : 1,
                    next_page_url:      "/articles/" + next_page_num,
                    previous_page_url:  "/articles/" + prev_page_num,
                };
                show_stream('articles', res, data);
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
    },

    'changes': function (req, res) {
        var page_num = 1;
        options.path = global_defaults.api_uri + "/posts/?sortby=modified";
        if ( req.params[0] && !isNaN(req.params[0]) ) {
            page_num = req.params[0] > 0 ? parseInt(req.params[0]) : 1;
            options.path = options.path + "&page=" + page_num;
        }

        http.get(options, function(getres) {
            var get_data = '';
            getres.on('data', function (chunk) {
                get_data += chunk;
            });

            getres.on('end', function() {
              var obj = JSON.parse(get_data);
              if ( getres.statusCode < 300 ) {
                var next_page_num = page_num + 1;
                var prev_page_num = page_num - 1;
                var data = {
                    background_image:   global_defaults.background_image,
                    blog_description:   global_defaults.site_description,
                    blog_title:         global_defaults.site_name,
                    pagetitle:          'Listed by Modified Date',
                    stream:             obj.posts,
                    default_values:     globals.getvalues(),
                    not_last_page:      obj.next_link_bool ? 1 : 0,
                    not_page_one:       page_num==1 ? 0 : 1,
                    next_page_url:      "/changes/" + next_page_num,
                    previous_page_url:  "/changes/" + prev_page_num,
                };
                show_stream('articles', res, data);
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
    },

    'user': function (req, res) {
        var page_num = 1;
        options.path = global_defaults.api_uri + "/posts";

        var author = "";
        if ( req.params[0] ) {
            author = req.params[0];
            options.path = options.path + "/?author=" + author;
        }

        if ( req.params[1] && !isNaN(req.params[1]) ) {
            page_num = req.params[1] > 0 ? parseInt(req.params[1]) : 1;
            options.path = options.path + "&page=" + page_num;
        }

        http.get(options, function(getres) {
            var get_data = '';
            getres.on('data', function (chunk) {
                get_data += chunk;
            });

            getres.on('end', function() {
              var obj = JSON.parse(get_data);
              if ( getres.statusCode < 300 ) {
                var next_page_num = page_num + 1;
                var prev_page_num = page_num - 1;
                var background_image  = global_defaults.background_image;
                if ( obj.blog_banner_image ) {
                    background_image = obj.blog_banner_image;
                }
                var data = {
                    background_image:   background_image, 
                    blog_author_image:  obj.blog_author_image,
                    blog_description:   obj.blog_description,
                    blog_title:         author,
                    pagetitle:          'Articles By ' + author,
                    filtered_author_name:  author,
                    filter_by_author_name: true,
                    search_results:     true,
                    search_type:        'userarticles',
                    search_string:      author,
                    stream:             obj.posts,
                    default_values:     globals.getvalues(),
                    not_last_page:      obj.next_link_bool ? 1 : 0,
                    not_page_one:       page_num==1 ? 0 : 1,
                    next_page_url:      "/userarticles/" + author + "/" + next_page_num,
                    previous_page_url:  "/userarticles/" + author + "/" + prev_page_num,
                };
                show_stream('articles', res, data);
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
    },

    'tag': function (req, res) {
        var page_num = 1;
        options.path = global_defaults.api_uri + "/searches/tag";

        var tagname = "";
        if ( req.params[0] ) {
            tagname = req.params[0];
            options.path = options.path + "/" + tagname;
        }

        if ( req.params[1] && !isNaN(req.params[1]) ) {
            options.path = options.path + "/" + req.params[1];
            page_num = req.params[1] > 0 ? parseInt(req.params[1]) : 1;
        }

        http.get(options, function(getres) {
            var get_data = '';
            getres.on('data', function (chunk) {
                get_data += chunk;
            });

            getres.on('end', function() {
              var obj = JSON.parse(get_data);
              if ( getres.statusCode < 300 ) {
                var next_page_num = page_num + 1;
                var prev_page_num = page_num - 1;
                var data = {
                    pagetitle:          'Search Results for Tag:' + tagname,
                    search_results:     true,
                    search_type:        'tag',
                    search_string:      tagname,
                    stream:             obj.posts,
                    default_values:     globals.getvalues(),
                    not_last_page:      obj.next_link_bool ? 1 : 0,
                    not_page_one:       page_num==1 ? 0 : 1,
                    next_page_url:      "/tag/" + tagname + "/" + next_page_num,
                    previous_page_url:  "/tag/" + tagname + "/" + prev_page_num,
                };
                show_stream('search', res, data);
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
    },

    'search': function (req, res) {
        var page_num = 1;
        options.path = global_defaults.api_uri + "/searches/string";

        var search_string = "";
        // GET request
        if ( req.params[0] ) {
            search_string = encodeURIComponent(req.params[0]);
            options.path = options.path + "/" + search_string;
        }

        if ( req.params[1] && !isNaN(req.params[1]) ) {
            options.path = options.path + "/" + req.params[1];
            page_num = req.params[1] > 0 ? parseInt(req.params[1]) : 1;
        }

        // POST request
        // or if ( req.body.keywords ) {
        if ( req.param('keywords') ) {
            search_string = encodeURIComponent(req.param('keywords'));
            options.path = options.path + "/" + search_string;
        }

        http.get(options, function(getres) {
            var get_data = '';
            getres.on('data', function (chunk) {
                get_data += chunk;
            });

            getres.on('end', function() {
              var obj = JSON.parse(get_data);
              if ( getres.statusCode < 300 ) {
                var next_page_num = page_num + 1;
                var prev_page_num = page_num - 1;
                var data = {
                    pagetitle:          'Search Results for:' + search_string,
                    search_results:     true,
                    search_type:        'search',
                    keywords:           decodeURIComponent(search_string),
                    search_string:      search_string,
                    stream:             obj.posts,
                    default_values:     globals.getvalues(),
                    not_last_page:      obj.next_link_bool ? 1 : 0,
                    not_page_one:       page_num==1 ? 0 : 1,
                    next_page_url:      "/search/" + search_string + "/" + next_page_num,
                    previous_page_url:  "/search/" + search_string + "/" + prev_page_num,
                };
                show_stream('search', res, data);
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
    },

};

module.exports = Stream;
