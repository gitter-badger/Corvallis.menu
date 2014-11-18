/*
This file handles the initialization of the node server.
*/

// Load required packages
var express = require("express")
var passport = require("passport")
var fs = require("fs")
require("./../../Shared/3rdParty/polyfill.js")

var database = require("./Database.js")
var search = require("./Search.js")

//generate local variables
database = database()
search = search(database)
var app = express()

//find root of server; should be just below the "server" folder
var root = __dirname.substring(0, __dirname.search("server"))



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
  res.sendFile("./Client/HTML/index.html", {root: root})
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
    
    if(response == false)
      res.send(response)
    else
      res.send(JSON.stringify(response))
  })
})

//Called when a client wants to make an order.
//validates the order, and returns the stripe
//payment form
app.get('/MakeOrder', function(req, res)
{
  DebugLog("MakeOrder requested...")
  
  //validate request
  if(!req)
  {
    console.log("empty request sent to MakeOrder.")
    res.send(false)
    return
  }
  
  //parse request
  var order = JSON.parse(req.query.Order)  
  
  //attempt to validate the order
  order = database.ValidateOrder(order)
  //if the order is invalid
  if(!order)
  {
    res.send(false)
    return
  }
  
  //At this point, we know that the order is valid.  
  //Add it to the database
  
    
  //Return swipe response to get payment
  DebugLog("Order completed successfully!")
  res.send(true)
})



var server = app.listen(3000);