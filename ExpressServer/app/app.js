var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs'); 
var lineReader = require('line-reader'); 
var sqlite3 = require('sqlite3').verbose(); 

/*
This code was given in the assignment zip files
---------------------------------------------
*/
function writeRecipesToFile(recipes){
  var filePath = 'test.txt';
  var outStream = fs.createWriteStream(filePath);
  for (i in recipes) {
    outStream.write(`${i}: ${recipes[i].recipe_name}\n`);
  }
  outStream.end();
  outStream.on('finish', function() {
    console.log('Writing to ' + filePath + ' complete');
  });
}
var db = new sqlite3.Database('recipes.db');
function writeRecipesToDatabase(recipes){
  
  db.serialize(function() {

     //drop existing table from database
     var sqlString = "DROP TABLE IF EXISTS recipes";	 
     db.run(sqlString);
     
	 //create table in the current database	 
     sqlString = "CREATE TABLE IF NOT EXISTS recipes (id INTEGER PRIMARY KEY, recipe_name TEXT, spices TEXT)";
	 
     db.run(sqlString);

     //use prepared statements to help prevent sql injection
     /*
     Prepared statements consist of SQL with ? parameters for data.
     Prepared statements are pre-compiled as SQL so that one cannot
     insert, or inject, SQL commands for the ? parameters.
     */
     var stmt = db.prepare("INSERT INTO recipes (recipe_name,spices) VALUES (?,?)");
     for (var i = 0; i < recipes.length; i++) {
   	    recipe = recipes[i];
        stmt.run(recipe.recipe_name, recipe.spices);
     }
     stmt.finalize();
  
     db.each("SELECT id, recipe_name, spices FROM recipes", function(err, row) {
         console.log(row.id + ": " +
             		 row.recipe_name + " " +
					 row.spices);
     });  

  });
}


//FILE PARSING CODE
function isTag(input){
	return input.startsWith("<");
}
function isOpeningTag(input){
	return input.startsWith("<") && !input.startsWith("</");
}
function isClosingTag(input){
	return input.startsWith("</");
}

var dataString = ''; //data between tags being collected
var openingTag = ''; //xml opening tag
var recipes = []; //recipes parsed
var recipe = {};  //recipe being parsed

//read aLaCarteData xml file one line at a time
//and parse the data into a JSON object string
//PRERQUISITE: the file must be validated XML

lineReader.eachLine(
    'aLaCarteData_rev3.xml', 
    function(line, last) { 
	    str = line.trim();
		if(isOpeningTag(str)){
			openingTag = str;
			dataString = '' //clear data string
		}
		else if(isClosingTag(str)){ 
		   if(str === '</recipe_name>') {
			   recipe.recipe_name = dataString;
		   }
		   else if(str === '</spices>'){
			   recipe.spices = dataString;
		   }
		   else if(str === '</recipe>'){
			   recipes.push(recipe);
			   recipe = {};
		   }
           openingTag = '';		   
		   //console.log("LINE " + str)
		}
		else {
			dataString += (" " + str);
		}

        if (last) {
		   //done reading file
           console.log("DONE");
 		   console.log(JSON.stringify(recipes, null, 4));
           writeRecipesToFile(recipes);
           writeRecipesToDatabase(recipes);		   
		   console.log('Number of Recipes: ' + recipes.length);
           return false; // stop reading 
           } 
}); 
/*
-------------------------------
End of Code given in assignment
*/
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
  recipesObj.recipes = ['recipe1', 'recipe2', 'recipe3'];

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
  //  send data back via JSON string
  //  let recipesJSON = JSON.stringify(recipesObj);
  //  console.log(recipesJSON);
  return res.contentType('application/json').json(recipesObj);
});

//create a function or a module for parsing the xml file and put it into 
//the database.
//The format and tag meanings are i the .txt file in the main directory

module.exports = app;
