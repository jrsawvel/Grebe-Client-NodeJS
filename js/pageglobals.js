require('../modules/date.format');

// constructor
var PageGlobals = function() {
};

//        background_image:  'http://grebe.soupmode.com/images/downtown-toledo-winter-a.jpg', 

function _get_date_time () {
    var myDate = new Date();
    return myDate.format('D, M j, Y - g:i a') + " UTC";
}

PageGlobals.prototype.getvalues = function() {

    var page_values = {
        datetime:          _get_date_time(),
        app:               'Grebe Node.JS',
        site_name:         'Grebe',
        home_url:          'http://nodejs.soupmode.com',
        host:              'grebe.soupmode.com',
        api_port:          80,
        api_uri:           '/api/v1',
        background_image:  'http://nodejs.soupmode.com/images/rivp-fall-4.jpg', 
        site_description:  'Read-only Node.js Client',
        cookie_prefix:     'nodejsgrebe',
    };

    return page_values;
};

module.exports = PageGlobals;

