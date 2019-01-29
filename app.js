require('dotenv').config();

const createError = require('http-errors');
const debug = require('debug')('e-photo:db');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const fileUpload = require('express-fileupload');

const User = require('./models/user');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// Connect to db
mongoose.connect(process.env.DB_URL, {
  useCreateIndex: true,
  useNewUrlParser: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  debug('Connected to MongoDB');
});

const app = express();
const store = new MongoDBStore({
  uri: process.env.DB_URL,
  collection: 'sessions',
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload({createParentPath: true}));

var sess = {
  secret: process.env.COOKIE_SECRET,
  cookie: { httpOnly: true, expires: Date.now() + 1000 * 60 * 60, maxAge: 1000 * 60 * 60},
  store: store,
  resave: true,
  saveUninitialized: false
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(flash());
app.use(session(sess));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async (req, res, next) => {
  let user = await User.find({});
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.title = 'Photo Gallery';
  res.locals.token = req.query.token;
  res.locals.user = user;
  res.locals.currentUser = req.user;
  res.locals.isAuthenticated = req.user ? true : false;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err.stack);
  req.flash('error', err.message);
  res.redirect('back');
});

// module.exports = app;

const port = process.env.PORT || 3000;

app.listen(port, function() {
  debug("Customers!");
});
