const express           = require('express');
const path              = require('path');
const hbs               = require('express-handlebars');
const morgan            = require('morgan');
const methodOverride    = require('method-override');
const flash             = require('connect-flash');
const session           = require('express-session');
const passport          = require('passport');
const MemoryStore       = require('memorystore')(session);


//////////////////////////////// INITIALIZER
const app               = express(); 
require('./config/passport');

//////////////////////////////// SETTINGS
app.set('port', process.env.PORT || 4000);
app.set('host', process.env.HOST || '0.0.0.0'); 
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', hbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

//////////////////////////////// MIDDLEWARES
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(
    express.json({
        // We need the raw body to verify webhook signatures.
        // Let's compute it only when hitting the Stripe webhook endpoint.
        verify: function (req, res, buf) {
            if (req.originalUrl.startsWith("/webhook")) {
                req.rawBody = buf.toString();
            }
        },
    })
);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    next();
});

//////////////////////////////// GLOBAL VABS
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
})

//////////////////////////////// STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

//////////////////////////////// ROUTES
app.use(require('./routes/index.routes'));
app.use(require('./routes/users.routes'));
///


module.exports = app;