/*
This file handles the initialization of the node server.
*/

//find root of server; should be just below the "server" folder
var root = __dirname.substring(0, __dirname.toLowerCase().search("server"))

// Load required packages
var express = require("express")
var passport = require("passport")
var bodyParser = require('body-parser')
var LocalStrategy = require("passport-local").Strategy
var fs = require("fs")
var requirejs = require("requirejs")

//configure requirejs for the server
//NOTE: This needs to be done now, since the require
//  statements below require require.js to be configured
requirejs.config(
{
  baseUrl: root,
  nodeRequire: require
})

//load required javascript
require("./../../Shared/3rdParty/polyfill.js")
var database = require("./Database.js")
var search = require("./Search.js")

//generate local variables
database = database()
search = search(database)
var app = express()

//prepare app to handle json post request data
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}));


//configure passport to handle user login
passport.use(new LocalStrategy(
  function(email, password, done)
  {
    //attempt to log the user in
    database.LoginUser(email, password).then(
      //if login successful
      function(user)
      {
        done(null, user)
      },
      //if user login failed
      function(err)
      {
        done(err)
      })
  })
)





/* METHODS */
function DebugLog(msg)
{
  if(true)
  {
    console.log(msg + "\n")
  }
}

//makes all files and subfolder files in the given folder
//visible to the client via GET
function _makeAccessableToClient(folder)
{
  //get subfiles and subfolders  
  fs.readdirSync(folder).forEach(function(file)
  {
    //compute absolute file path
    var filePath = folder + "/" +file;
    
    //If file is a subfolder
    var stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) 
    {
        _makeAccessableToClient(filePath)
    } 
    else 
    {
      //compute 'GET' path, which is the absolute path
      //minus the prefixing location of the server
      var getPath = "/"+filePath.substring(root.length, filePath.length)
      getPath = getPath.replace(/\\/g,"/")
      
      //prepare server to handle GET requests for this file
      app.get(getPath, function(req, res)
      {
        res.sendFile(filePath)
      });
    }
  });
}





//make client side files accessible via GET
_makeAccessableToClient(root + "Client")
_makeAccessableToClient(root + "Shared")

app.get('/', function(req, res)
{
  res.sendFile(root+ "/Client/HTML/index.html")
});




//Checks to see that a client has current database information.
//If database is out of sync, sends current information to client,
//else sends nothing.
app.get('/SearchHeartbeat', function(req, res)
{
  DebugLog("SearchHeartbeat requested...")
  search.Heartbeat(req, function(response)
  {
    DebugLog("SearchHeartbeat returning:  "+response)
    res.send(JSON.stringify(response))
  })
})

//Called when a client wants to make an order.
//validates the order, and stores it in the database
app.post('/SubmitOrder', function(req, res)
{
  DebugLog("Submit order requested...")
  
  //validate request
  if(!req)
  {
    console.log("empty request sent to MakeOrder.")
    res.send(false)
    return
  }
  
  //parse request
  var order = JSON.parse(req.body.Order)
  
  //attempt to process the order
  database.ProcessOrder(order).then(
    //if processed successfully
    function()
    {
      DebugLog("Order completed successfully!")
      res.send(true)
    },
    //if processing failed
    function(err)
    {
      DebugLog("Order could not be created: " + err)
      res.send(false)
    }
  )  
})

//Function handling registration of users
app.post('/RegisterUser', function(req, res)
{
  if(!req)
  {
    console.log("Empty request sent to register user.")
    res.send(false)
    return
  }
})


var server = app.listen(3000)

DebugLog("Server started at: " + root)