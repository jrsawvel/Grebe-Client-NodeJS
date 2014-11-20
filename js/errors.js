
var PageGlobals = require('./pageglobals');
var globals         = new PageGlobals();

var Errors = {

    error404: function (req, res, next) {
        var data = {
            user_message:   'Invalid function request ' + req.originalUrl,
            system_message: 'Action is unsupported', 
            pagetitle: 'Error',
            default_values: globals.getvalues()
        };
        res.render('error', data);
    }
};

module.exports = Errors;
