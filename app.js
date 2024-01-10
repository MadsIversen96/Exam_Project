var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger-output.json')
const bodyParser = require('body-parser')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var initRouter = require('./routes/init');
var authRouter = require('./routes/auth');
var adminRouter = require('./routes/admin');
var brandsRouter = require('./routes/brands');
var categoriesRouter = require('./routes/categories');
var cartsRouter = require('./routes/carts');
var ordersRouter = require('./routes/orders');
var productsRouter = require('./routes/products');
var searchRouter = require('./routes/search');
var checkoutRouter = require('./routes/checkout');
var rolesRouter = require('./routes/roles');

var db = require("./models");
db.sequelize.sync({ force: false })

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/init', initRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/brands', brandsRouter);
app.use('/categories', categoriesRouter);
app.use('/carts', cartsRouter);
app.use('/orders', ordersRouter);
app.use('/products', productsRouter);
app.use('/search', searchRouter);
app.use('/checkout', checkoutRouter);
app.use('/roles', rolesRouter);

app.use(bodyParser.json())
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
