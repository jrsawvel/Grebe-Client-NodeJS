
// constructor
var UserCookies = function() {
};

UserCookies.prototype.getvalues = function(req) {

    var user_cookies = {
        sessionid:   req.cookies.nodejsgrebesessionid,
        userid:      req.cookies.nodejsgrebeuserid,
        username:    req.cookies.nodejsgrebeusername,
        current:     req.cookies.nodejsgrebecurrent,
        loggedin:    req.cookies.nodejsgrebeuserid,
    };

    return user_cookies;
};

module.exports = UserCookies;

