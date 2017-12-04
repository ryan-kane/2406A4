var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//const PORT = 3000;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
  
  //this is an object containing all the information of the search 
  //and the recipes
  let recipesObj = {};

  //recipesObj.count = number of results
  //recipesObj.query = the actual query by the client
  //recipesObj.recipes = [] array containing all the recipes

  //the JSON data has to account for all the recipe data in the XML file
  //so each recipe can be its own object
  //  recipe.recipe_name
  //  recipe.contributor
  //  recipe.category
  //  recipe.description
  //  recipe.spices = [] is an array
  //  recipe.source
  //  recipe.rating
  //  recipe.ingredients = [] is an array
  //  recipe.directions
  //send data back via JSON string
  // let recipesJSON = JSON.stringify(recipesObj);
  // console.log(recipesJSON);
  return res.contentType('application/json').json(recipesObj);
});

//create a function or a module for parsing the xml file and put it into 
//the database.
//The format and tag meanings are i the .txt file in the main directory

module.exports = app;
