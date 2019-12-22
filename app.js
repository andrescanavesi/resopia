const { Logger } = require('./utils/Logger');

const log = new Logger('app');

const createError = require('http-errors');
const express = require('express');
const favicon = require('express-favicon');
const compression = require('compression');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const useragent = require('express-useragent');

const indexRouter = require('./routes/index');
const recipeRouter = require('./routes/recipe');
const sitemapRouter = require('./routes/sitemap');

const app = express();
app.use(compression());
app.use(useragent.express());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(`${__dirname}/public/images/favicon.png`));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/recipe', recipeRouter);
app.use('/sitemap.xml', sitemapRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  if (req.app.get('env') === 'test') {
    log.error(err.message);
  } else {
    log.error(err);
  }

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
