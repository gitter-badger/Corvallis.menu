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
var LocalStrategy = require("passport-local").Strategy
var RememberMeStrategy = require("passport-remember-me").Strategy
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
app.use(flash())

//teach passport to serialize users
passport.serializeUser(function(user, done)
{
    //stored/retrieved by id
    done(null, user.id);
})

//teach passport to deserialize users
passport.deserializeUser(function(id, done)
{
  var user = database.GetUserById(id)
  if(user)
    done(null, user)
  else  
    done("User could not be found.", null)
})

//teach passport to register users
passport.use("local-register", new LocalStrategy(
{
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true
},
function(req, email, password, done)
{
  database.CreateUser(req.body.email, req.body.password, req.body.name, req.body.phone)
    .then(
    //User created successfully.
    function(user)
    { 
      console.log("New user registered:" + user.email)
      done(null, user)
    },
    //user creation failed
    function(err)
    {
      console.log("User registration failed: " + err)
      done(err, false)
    }
  )
}))

//teach passport to login users
passport.use("local-login", new LocalStrategy(
{
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true
},
function(req, email, password, done)
{
  database.LoginUser(email, password)
  .then(
    //if login successful
    function(user)
    {
      done(false, user)
    },
    //if login unsuccessful
    function(err)
    {
      done(err, false)
    }
  )  
}))




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



//make client side files accessible via GET
_makeAccessableToClient(wwwFolder)

_loadTemplates()

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

app.post("/RegisterUser", function(req, res, next)
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


app.post("/Login", function(req, res, next)
{
  DebugLog("Login requested...")
  
  //attempt to log into the account using passport
  passport.authenticate('local-login', function(err, user, info)
  {
    if(err)
    {
      DebugLog("Returning error: " + JSON.stringify(err))
      res.send({pkg: JSON.stringify({err: err})})
    }
    else
    {
      DebugLog("Returning user: " + user.ToJson().Email)
      res.send({pkg: JSON.stringify({user: user.ToJson()})})
    }
  })(req, res, next)
  
})

app.get("/Logout", function(req,res)
{
  DebugLog("Logout requested...")
  req.logout()
})

app.get("/Test", _userIsDeliverer,
function(req, res)
{
  res.send("Success")
})

var server = app.listen(3030)

DebugLog("Server started at: " + root)