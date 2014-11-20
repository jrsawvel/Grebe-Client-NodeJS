
var http        = require('http');
var PageGlobals = require('./pageglobals');

var globals         = new PageGlobals();
var global_defaults = globals.getvalues();

var options = {
  host: global_defaults.host,
  port: 80,
  path: ''
};

var Search = {

    'form': function (req, res) {
        var data = {
            pagetitle: 'Search Form',
            default_values: globals.getvalues()
        };
        res.render('searchform', data);
    }
};

module.exports = Search;
