var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//routes
//initially launching the page
app.get('/', (req, res)=>{
  return res.render('recipes.jade', {title: "Recipe App"});
});

//initially launching the page
app.get('/recipes', (req, res) =>{
  return res.render('recipes.jade', {title: "Recipe App"});
});

//client searching queries
app.post('/', (req, res) => {
  console.log(req.query);
  //here we send back the data in JSON form
  let ingrdients = req.query.ingredients;
  let spices = req.query.spices;
  //search the database for recipes with all spices and ingredients
  let returnObj;
  //send data back via JSON string
  return res.contentType('application/json').json(JSON.stringify(returnObj));
});

//create a function or a module for parsing the xml file and put it into 
//the database

module.exports = app;
