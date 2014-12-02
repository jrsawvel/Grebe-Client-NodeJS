var express        = require('express'),
    bodyParser     = require('body-parser'),
    exphbs         = require('express-handlebars'),
    path           = require('path'),
    post           = require('./showpost'),
    tags           = require('./tags'),
    source         = require('./showpostsource'),
    errors         = require('./errors'),
    search         = require('./search'),
    relatedposts   = require('./relatedposts'),
    versions       = require('./versions'),
    user           = require('./user'),
    stream         = require('./stream'),
    login          = require('./login'),

    app = express();


app.engine('hbs', exphbs({
    extname:'hbs', 
    layoutsDir:     path.join(__dirname, '../views/layouts'),
    defaultLayout:  path.join(__dirname, '../views/layouts/main.hbs'),
    partialsDir:    path.join(__dirname, '../views/partials'),
}));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

//  the regex in app.get supports the following URIs:
//    /248 - /248/ - /248/site-info
app.get(/^\/([0-9]+)(?:\/([0-9a-zA-Z_\-]*))?$/, post.show);

app.get(/^\/(post)\/([0-9a-zA-Z_\-]+)?$/,       post.show);

app.get(/^\/(source)\/([0-9]+)(?:\/([0-9a-zA-Z_\-]*))?$/, source.show);

app.get(/^\/tags(?:\/(.*))?$/, tags.tags);

app.get('/searchform', search.form);

app.get(/^\/relatedposts\/([0-9]+)(?:\/([0-9a-zA-Z_\-]*))?$/, relatedposts.list);

app.get(/^\/versions\/([0-9]+)(?:\/([0-9a-zA-Z_\-]*))?$/, versions.list);
app.post('/compare', versions.compare);

app.get(/^\/user(?:\/(.*))?$/, user.show);

app.get('/', stream.homepage);

app.get(/^\/articles(?:\/(.*))?$/, stream.homepage);

app.get(/^\/changes(?:\/(.*))?$/, stream.changes);

// tag/nodejs/3 - 3 = page number
app.get(/^\/tag\/([0-9a-zA-Z_\-+]+)$/, stream.tag);
app.get(/^\/tag\/([0-9a-zA-Z_\-+]+)\/([0-9]*)$/, stream.tag);

app.get(/^\/search\/([^\/]+)$/, stream.search);
app.get(/^\/search\/(.+)\/([0-9]*)$/, stream.search);
app.post('/search', stream.search);

app.get(/^\/userarticles\/([0-9a-zA-Z_\-]+)$/, stream.user);
app.get(/^\/userarticles\/([0-9a-zA-Z_\-]+)\/([0-9]*)?$/, stream.user);

app.get('/login', login.form);

app.use(errors.error404);

app.listen(3000);
