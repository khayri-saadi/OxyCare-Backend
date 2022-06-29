var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const errorcontroller = require('./controllers/errorController')


var usersRouter = require('./routes/users');
const messageRouter = require('./routes/messageRoute')
const errorController = require('./controllers/errorController');

var app = express();








// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev')); //
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',(req,res) => {
  res.json({
    success : true,
    data : {
      message : 'hello from the server side '
    }
  })
})
app.use('/msg',messageRouter)
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(errorController)

module.exports = app;
