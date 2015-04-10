/*
This file handles the initialization of the node server.
*/

//find root of server; should be just below the "server" folder
var root = __dirname.substring(0, __dirname.toLowerCase().search("server"))
var wwwFolder = root + "www/"
var templatesFolder = wwwFolder + "HTML/"
var cssFolder = wwwFolder + "CSS/"
var thirdPartyFolder = wwwFolder + "Shared/3rdParty/"
var templates
var css

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
var watch = require("node-watch")

require(thirdPartyFolder + "polyfill.js")
var search = require("./Search.js")
var passportSetup = require("./PassportSetup.js")

//configure requirejs for the server
//NOTE: This needs to be done now, since the require
//  statements below require require.js to be configured
requirejs.config(
{
  baseUrl: root,
  nodeRequire: require
})

requirejs(["server/js/Database"],
function(Database)
{
  //generate local variables
  var database = new Database()
  search = search(database)

          
  //Configure express
  var app = express()

  app.use(cookieParser())
  app.use(bodyParser.urlencoded({extended: true})) 
  app.use(bodyParser.json()) 
  app.use(session(
    {
      secret:"kittykittymeowmeow",
      resave: true,
      saveUninitialized: true
    }))  
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(passport.authenticate('remember-me'))
  app.use(flash())

  //call PassportSetup.js, configuring passport
  passportSetup(database, app, passport)

  //starts the watching of the HTML folder,
  //ensuring that templates are reloaded if the
  //folder changes, and any templates may have changed.
  watch(templatesFolder, _loadTemplates)
  watch(cssFolder, _loadCSS)
  
  _loadTemplates()
  _loadCSS()
  //make client side files accessible via GET
  _makeAccessableToClient(wwwFolder)


  /* MIDDLEWARE */
  function _loggedIn(req, res, next)
  {
    if(req.isAuthenticated())
      return next()
    else
      res.send("Not logged in.")
  }


  function _isAdmin(req, res, next)
  {
    //ensure user is logged in
    _loggedIn(req, res, 
    function(req, res, next)
    {
      //if user is not an admin, fail
      if(!req.session.user.admin)
        res.send("Lacking administrative privileges.")
      
      else
        return next()
    })  
  }

  function _isDeliverer(req, res, next)
  {
    //ensure user logged in
    _loggedIn(req, res, 
    function(req, res, next)
    {
      //if the user is not a deliverer, fail
      if(!req.session.user.deliverer)
        res.send("User not a deliverer.")
      
      else
        next()
    }) 
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
    findFiles(folder, function(subPath, filePath)
    {
      //load file and store it in templates
      DebugLog("File gettable: " + subPath)
      
      app.get('/'+subPath, function(req, res)
      {
        res.sendFile(filePath)
      });
    })
  }


  //loads all of the templates from the www/HTML folder.
  //Templates are stored as objects keyed by their file name
  function _loadTemplates()
  {
    templates = {}
    findFiles(templatesFolder, function(subPath, filePath)
    {
      //load file and store it in templates
      DebugLog("Loaded template: " + subPath)
      fs.readFile(filePath, "utf8", function(err, data)
      {
        if(err) throw err
        templates[subPath] = data
      })
    })
  }
  
  function _loadCSS()
  {
    css = {}
    findFiles(cssFolder, function(subPath, filePath)
    {
      //load file and store it in templates
      DebugLog("Loaded css: " + subPath)
      fs.readFile(filePath, "utf8", function(err, data)
      {
        if(err) throw err
        css[subPath] = data
      })
    })
  }
  
  //Helper function. Goes through the given folder and its subfolders.
  //When a file is reached, "then" is called and fed the  
  function findFiles(base, then, subPath)
  {  
    var folder = base + (subPath ? "/" + subPath : "")
    //get subfiles and subfolders  
    fs.readdirSync(folder).map(function(file)
    {
      //compute absolute file path
      var filePath = folder + '/' +file;
      var nextSubPath = (subPath ? subPath + "/" : "") + file
      
      //If file is a subfolder
      var stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) 
      {
        findFiles(base, then, nextSubPath)
      } 
      else 
      {          
        then(nextSubPath, filePath)
      }
    })
  }


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
  
  app.get('/css',function(req, res)
  {
    //if the templates have already been loaded
    if(templates)
    {
      //return templates to client
      res.send("css = " + JSON.stringify(css))
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

  //When square receives an order update for our service,
  //they will send it here to notify our server.
  app.post("/SquareHook", function(req, res)
  {
  })


  //Called when a client wants to make an order.
  //validates the order, and stores it in the database
  app.post('/SubmitOrder', function(req, res)
  {
    DebugLog("Submit order requested...")
    
    //validate request
    if(!req.body)
    {
      console.log("empty request sent to MakeOrder.")
      res.send(false)
      return
    }
    
    //attempt to process the order
    database.ProcessOrder(req.body)
    .then(
      //if processed successfully
      function(order)
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
      //attempt to register the account using passport
      passport.authenticate('local-register', 
      function(err, user, info)
      {
        DebugLog("Register user requested...")
        if(err)
        {
          DebugLog("registration failed: " + err)
          res.send(JSON.stringify({err: err}))
        }
        else
        {
          DebugLog("Email registered: " + user.email)
          res.send(JSON.stringify({user: user.ToJson()}))    
        }      
      })(req, res, next)
    }
  )

  app.post("/UpdateUser", _loggedIn,
  function(req, res)
  {  
    DebugLog("UpdateUser requested.")
    if(!req.body || !req.body.userId)
    {
      res.send(false)
      return false
    }
    //get user being modified
    var userToModify = database.GetUserById(req.body.userId)
    //if the user could be updated successfully
    if(userToModify.Update(req.body, req.user))
      res.send(JSON.stringify(userToModify))
    else
      res.send(false)
  })


  app.post("/Login", _preventFlooding, 
    function(req, res, next)
    {
      //attempt to log into the account using passport
      passport.authenticate('local-login', 
      function(err, user, info)
      {
        DebugLog("Processing login request.")
        //if the user failed to log in
        if(err)
        {
          DebugLog("Returning error: " + JSON.stringify(err))
          res.send(JSON.stringify({err: err}))
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
              res.send(JSON.stringify({user: user.ToJson()}))
            })
          }
          else
          {
            DebugLog("Returning user: " + user.ToJson().Email)
            res.send(JSON.stringify({user: user.ToJson()}))
          }
        }
      })(req, res, next)
    }
  )

  app.post("/GetUser", _loggedIn, 
  function(req, res, next)
  {
    res.send(JSON.stringify({user: req.user.ToJson()}))
  })

  app.get("/Logout", function(req,res)
  {
    DebugLog("Logout requested...")
    res.clearCookie("remember_me")
    req.logout()
    res.send(true)
  })

  var server = app.listen(3030)

  console.log("Server started.")
})