
var http        = require('http');
var PageGlobals = require('./pageglobals');

var globals         = new PageGlobals();
var global_defaults = globals.getvalues();

var options = {
  host: global_defaults.host,
  port: 80,
  path: ''
};

var Login = {

    'form': function (req, res) {
        var data = {
            pagetitle: 'Login Form',
            default_values: globals.getvalues()
        };
        res.render('loginform', data);
    }
};

module.exports = Login;
