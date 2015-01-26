/*
This file handles the initialization of the node server.
*/

//find root of server; should be just below the "server" folder
var root = __dirname.substring(0, __dirname.toLowerCase().search("server"))
var wwwFolder = root + "www/"
var templatesFolder = wwwFolder + "HTML/"
var thirdPartyFolder = wwwFolder + "Shared/3rdParty/"
var templates

// Load required packages
var express = require("express")
var passport = require("passport")
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var flash = require('connect-flash')
//var RememberMeStrategy = require("./PassportStrategy.js")
var fs = require("fs")
var requirejs = require("requirejs")
var _ = require("underscore")

//configure requirejs for the server
//NOTE: This needs to be done now, since the require
//  statements below require require.js to be configured
requirejs.config(
{
  baseUrl: root,
  nodeRequire: require
})

DebugLog("RequireJS rooted at " + root)

//load required javascript
require(thirdPartyFolder + "polyfill.js")
var database = require("./Database.js")
var search = require("./Search.js")
var passportSetup = require("./PassportSetup.js")

//generate local variables
database = database()
search = search(database)

//Configure express
var app = express()

app.use(cookieParser())
app.use(bodyParser()) 
app.use(session({secret:"kittykittymeowmeow"}))  
app.use(passport.initialize())
app.use(passport.session())
app.use(passport.authenticate('remember-me'))
app.use(flash())

//call PassportSetup.js, configuring passport
passportSetup(database, app, passport)


/* METHODS */
function _userLoggedIn(req, res, next)
{
  if(req.isAuthenticated())
    return next()
  else
    res.send("Not logged in.")
}


function _userIsAdmin(req, res, next)
{
  //if the user is not logged in
  if(!req.session.user)
    res.send("Not logged in.")
  //if the user is not an admin
  else if(!req.session.user.admin)
    res.send("Lacking administrative privileges.")
  //success!
  else
    next()
}


function _userIsDeliverer(req, res, next)
{
  console.log(req.session.user.deliverer)
  //if the user is not logged in
  if(!req.session.user)
    res.send("Not logged in.")
  //if the user is not a deliverer
  else if(!req.session.user.deliverer)
    res.send("User not a deliverer.")
  //success!
  else
    next()
}

//This middleware function is used to prevent
//a route from being flooded. This is useful to prevent
//brute forcing of passwords.
function _preventFlooding(req, res, next)
{
  //compute session variables for given request url
  var attemptCounterKey = "attemptCounter"+req.url
  var lastAttemptKey = "lastAttempt"+req.url
  
  //compute moment of login request
  var date = new Date()
  var now = date.getMinutes() + date.getSeconds()/60
  
  
  //itterate counter
  if(!req.session[attemptCounterKey])
    req.session[attemptCounterKey] = 0
  req.session[attemptCounterKey]++
 
  
  //if the user has prodded this URL more than 50 times...
  if(req.session[attemptCounterKey] > 50)
    //and if it has been less than 30 seconds since the last request was processed
    if(Math.abs(req.session[lastAttemptKey] - now)< .5)
    {
      DebugLog("Denying request due to flooding.")
      var err = {Message: "Too many requests, please wait 30 seconds."}
      res.send({pkg: JSON.stringify({err: err})})
      return false
    }
    
  req.session[lastAttemptKey] = now
  return next()
}


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
      //minus the prefixing location of the wwwFolder
      var getPath = ""+filePath.substring(wwwFolder.length, filePath.length)
      getPath = getPath.replace(/\\/g,"/")
      
      //prepare server to handle GET requests for this file
      app.get(getPath, function(req, res)
      {
        res.sendFile(filePath)
      });
    }
  });
}


//loads all of the templates from the www/HTML folder.
//Templates are stored as objects keyed by their file name
function _loadTemplates()
{
  templates = {}
  fs.readdir(templatesFolder, function(err, files)
  {
    _.each(files, function(file)
    {
      //compute absolute file path
      var filePath = templatesFolder + "/" +file
      if(filePath.endsWith(".html"))
      {
        fs.readFile(filePath, "utf8", function(err, data)
        {
          if(err) throw err
          templates[file] = data
        })
      }
    })    
  })
}

//starts the watching of the HTML folder,
//ensuring that templates are reloaded if the
//folder changes, and any templates may have changed.
fs.watch(templatesFolder, _loadTemplates)
_loadTemplates()



//make client side files accessible via GET
_makeAccessableToClient(wwwFolder)


app.get('/', function(req, res)
{
  res.sendFile(root+ "www/index.html")
})

//Required for browsers and phonegap apps 
//to be built off the same index page
app.get("/cordova.js", function(req, res)
{
  res.send("")
})

app.get('/Templates',function(req, res)
{
  //if the templates have already been loaded
  if(templates)
  {
    //return templates to client
    res.send("Templates = " + JSON.stringify(templates))
    return
  }
})


//Checks to see that a client has current database information.
//If database is out of sync, sends current information to client,
//else sends nothing.
app.get('/SearchHeartbeat', function(req, res)
{
  search.Heartbeat(req, function(response)
  {
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
  database.ProcessOrder(order)
  .then(
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

app.post("/RegisterUser", _preventFlooding,
function(req, res, next)
{
  DebugLog("Register user requested...")
  //attempt to register the account using passport
  passport.authenticate('local-register', function(err, user, info)
  {
    if(err)
    {
      DebugLog("registration failed: " + err)
      res.send({pkg: JSON.stringify({err: err})})
    }
    else
    {
      DebugLog("Email registered: " + user.email)
      res.send({pkg: JSON.stringify({user: user.ToJson()})})    
    }      
  })(req, res, next)
})


app.post("/Login", _preventFlooding, 
function(req, res, next)
{
  DebugLog("Processing Login request.")
  
  //attempt to log into the account using passport
  passport.authenticate('local-login', function(err, user, info)
  {
    //if the user failed to log in
    if(err)
    {
      DebugLog("Returning error: " + JSON.stringify(err))
      res.send({pkg: JSON.stringify({err: err})})
    }
    //if the user logged in successfully
    else
    {
      //if the user checked the remember me checkbox
      if(req.body.rememberMe == "true")
      {
        //generate token for user
        database.CreateRememberMeToken(user)
        .then(function(token)
        {
          //set cookie as token
          DebugLog("Set 'remember-me' cookie for " + user.ToJson().Email)
          res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 })
          res.send({pkg: JSON.stringify({user: user.ToJson()})})
        })
      }
      else
      {
        DebugLog("Returning user: " + user.ToJson().Email)
        res.send({pkg: JSON.stringify({user: user.ToJson()})})
      }
    }
  })(req, res, next)
})

app.post("/GetUser", _userLoggedIn, 
function(req, res, next)
{
  res.send({pkg: JSON.stringify({user: req.user.ToJson()})})
})

app.get("/Logout", function(req,res)
{
  DebugLog("Logout requested...")
  res.clearCookie("remember_me")
  req.logout()
  res.send(true)
})

var server = app.listen(3030)

DebugLog("Server started at: " + root)