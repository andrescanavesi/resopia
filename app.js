const createError = require('http-errors');
const express = require('express');
const favicon = require('express-favicon');
const compression = require('compression');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const useragent = require('express-useragent');
const { Logger } = require('./utils/Logger');

const indexRouter = require('./routes/index');
const sitemapRouter = require('./routes/sitemap');
const adminRouter = require('./routes/admin');

const responseHelper = require('./utils/response_helper');
const utils = require('./utils/utils');

const log = new Logger('app');

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

// redirect any page form http to https
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test' && !utils.isSecure(req)) {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
  } else {
    next();
  }
});

app.use('/', indexRouter);
app.use('/sitemap.xml', sitemapRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
// app.use((req, res, next) => {
//   next(createError(404));
// });

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

  const responseJson = responseHelper.getResponseJson(req);

  if (err.status === 404) {
    responseJson.message = 'Página no encontrada';
  } else if (process.env.NODE_ENV === 'production') {
    // do not print internal messages in production
    responseJson.message = 'Ha ocurrido un error inesperado. por favor, intenta más tarde';
  }

  // render the error page
  res.status(err.status || 500);
  res.render('error', responseJson);
});

module.exports = app;
