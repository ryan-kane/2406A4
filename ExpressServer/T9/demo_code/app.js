/*
Basic express server with middleware, SQLite database, and Handlebars template rendering.

The server allows client to find chord progressions of songs in
its SQLite database. The database provided has chord progressions
of some 1200 popular jazz standards.

Here we use server-side templating using the Handlebars template engine to generate the HTML for the response pages to send to the client.
Handlebars is a popular templating format/engine.
Other popular ones include: PUG (formarly Jade), EJS, Liquid, Mustache.
Handlebar views are rendered from data obtained from the SQLite database. 

The template engine merges data provided in the form of a javascript object
with html represented in the .hbs handlebars template files.
The combination is 'rendered' and sent to the client as .html.

This is an Express 4.x application.
Here we use a routes module. We put our route handling code in
a separate module that is required by the main app.

We use the exported route functions in the 'use' and 'get'
routes. Typically 'use' calls functions that invoke next() whereas our 
get and post routes send responses to the client.

Testing: (user: ldnel password: secret)
http://localhost:3000/index.html
http://localhost:3000/users
http://localhost:3000/find?title=Love
http://localhost:3000/song/372
*/

//Cntl+C to stop server

var http = require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

var  app = express(); //create express middleware dispatcher

const PORT = process.env.PORT || 3000

//Read Xml FILe to DataBase
//This code was provided with the assignment
var fs = require('fs'); //built in node file system module
var lineReader = require('line-reader'); //npm install line-reader
var sqlite3 = require('sqlite3').verbose(); //npm install sqlite3

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

function writeRecipesToDatabase(recipes){
  var db = new sqlite3.Database('data/recipes.db');
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
  db.close();
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
    'aLaCarteData_rev2.xml', 
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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs'); //use hbs handlebars wrapper

app.locals.pretty = true; //to generate pretty view-source code in browser

//read routes modules
var routes = require('./routes/index');

//some logger middleware functions
function methodLogger(request, response, next){           
		   console.log("METHOD LOGGER");
		   console.log("================================");
		   console.log("METHOD: " + request.method);
		   console.log("URL:" + request.url);
		   next(); //call next middleware registered
}
function headerLogger(request, response, next){           
		   console.log("HEADER LOGGER:")
		   console.log("Headers:")
           for(k in request.headers) console.log(k);
		   next(); //call next middleware registered
}

//register middleware with dispatcher
//ORDER MATTERS HERE
//middleware
app.use(routes.authenticate); //authenticate user
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//app.use(methodLogger);
//routes
app.get('/recipes', routes.index); 
app.get('/', routes.index);
app.get('/find', routes.find);
app.get('/users', routes.users);
app.get('/recipes/*', routes.recipeDetails);

//start server
app.listen(PORT, err => {
  if(err) console.log(err)
  else {console.log(`Server listening on port: ${PORT} CNTL:-C to stop`)}
})