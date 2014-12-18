
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

var Search = {

    'form': function (req, res) {
        var uc = user_cookies.getvalues(req);
        var default_values = globals.getvalues();
        default_values.user_cookies = uc;
        var data = {
            pagetitle: 'Search Form',
            default_values: default_values
        };
        res.render('searchform', data);
    }
};

module.exports = Search;
