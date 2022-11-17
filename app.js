var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
const nocache = require("nocache");
//const fileUpload = require('express-fileupload');
var bodyParser = require('body-parser')

var hbs = require('express-handlebars')
var db = require('./coinfig/connection')


var indexRouter = require('./routes/index');
var AdminRouter = require('./routes/admin');






var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views',partialDrr:__dirname+'/views/partials'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(nocache());
//app.use(fileUpload());
bodyParser.json()

app.use(bodyParser.urlencoded({extended: false}))
//session is creating
app.use(session({secret:"key",cookie:{maxAge:6000000}}))



// mongoclientconnecting
db.connect((err)=>{
  if(err){
    console.log(err)
  }
  else{
    console.log("connected")
  }
})
//usind indexrouter
app.use('/', indexRouter);

//using the adminindex router
app.use('/admin',AdminRouter)


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
