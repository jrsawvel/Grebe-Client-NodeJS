require('../modules/date.format');

var myDate = new Date();
var dt_str = myDate.format('D, M j, Y - g:i a') + " UTC";

// constructor
var PageGlobals = function() {
};

//        background_image:  'http://grebe.soupmode.com/images/downtown-toledo-winter-a.jpg', 

PageGlobals.prototype.getvalues = function() {

    var page_values = {
        datetime: dt_str,
        app:               'Grebe Node.JS',
        site_name:         'Grebe',
        home_url:          'http://nodejs.soupmode.com',
        host:              'grebe.soupmode.com',
        api_uri:           '/api/v1',
        background_image:  'http://nodejs.soupmode.com/images/rivp-fall-4.jpg', 
        site_description:  'Read-only Node.js Client',
    };

    return page_values;
};

module.exports = PageGlobals;

