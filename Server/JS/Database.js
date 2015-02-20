define(["require", "www/Shared/3rdParty/PhoneFormat", "Server/JS/OrderManager", "server/js/User"],
function(req, PhoneFormat, OrderManager, User)
{
  function Database()
  {
    /* PUBLIC METHODS */
    this.GetVenderData = function(){ return venderData }
    this.GetVersion = function(){ return version }
    
    this.GetUserById = function(userId)
    {
      return Users[userId]
    }
    
    //Consumes the given token, finding its corresponding user
    //in the RememberMeTokens table, and returning said user.
    this.ConsumeRememberMeToken = function(token)
    {
      var tokenHash = md5(token)
      return new Promise(function(fulfill, reject)
      {
        //check to see if the user already exists
        var sql = "SELECT userId from RememberMeTokens where tokenHash = $tokenHash"
        
        var qry = db.prepare(sql)
        qry.all({$tokenHash: tokenHash}, function(err, rows)
        {
          //if the token doesn't exist
          if(rows.length <= 0)
          {
            reject("Given token not registered in server.")
            return
          }
          //if there were multiple tokens retrieved by this query
          else if(rows.length > 1)
          {
            reject("Given token registered multiple times. Uh oh.")
            return
          }
          
          //get the user who created the token
          var user = Users[rows[0].userId]
          if(!user)
          {
            reject("User not present in database memory.")
            return
          }
          
          //delete token
          var sql = "DELETE FROM RememberMeTokens WHERE tokenHash = $tokenHash"
          var qry = db.prepare(sql)
          qry.run({$tokenHash: tokenHash})
          
          //return user
          fulfill(user)
        })
      })
    }

    this.CreateRememberMeToken = function(user)
    {
      return new Promise(function(fulfill, reject)
      {
        //generate random token
        var token = _randomString(64)
        
        //ensure token does not already exist in database
        var sql = "SELECT * from RememberMeTokens where tokenHash = $token"
        var qry = db.prepare(sql)
        qry.all({$token: md5(token)}, function(err, rows)
        {
          if(err)
          {
            reject(err)
            return
          }
          
          //if this token is already registered
          if(rows.length > 0)
          {
            //recursively attempt to generate another token
            CreateRememberMeToken()
            .then(function(token)
            {
              fulfill(token)
            },
            function(err)
            {
              reject(err)
            })
          }
          //if this token is not yet registered
          else
          {
            //register the token
            var sql = "INSERT into RememberMeTokens(tokenHash, userId) Values($token, $userId)"
            var qry = db.prepare(sql)
            qry.run({$token: md5(token), $userId: user.userId})
            
            //return the token
            fulfill(token)
          }
        })
      })
    }
    
    //Processes the given order, validating it,
    //and adding it to the local database
    this.ProcessOrder = function(order)
    {
      return orderManager.ProcessOrder(order) 
    }
    
    
    //Attempts to login the user with the given email and password.
    this.LoginUser = function(email, password)
    {
      return new Promise(function(fulfill, reject)
      {
        //get user from database
        var sql = "select userId, password from Users where email = $email"
        var qry = db.prepare(sql)
        qry.all({$email: email}, function(err, rows)
        {
          if(err)
            reject({err: err})
          else if(rows.length <= 0)
            reject({Email: "Email not registered."})
          else if(rows.length > 1)
            reject({Email: "Email registered more than once."})
          else if(rows[0].password != md5(password))
            reject({Password: "Password incorrect."})
          else
          {
            fulfill(Users[rows[0].userId])
          }
        })
      })
    }
    
    //Creates a user with the given properties
    this.CreateUser = function(email, password, name, phone)
    {    
      //prepare the query checking if the given email address is available
      var emailNotTaken = new Promise(function(fulfill, reject)
      {
        //check to see if the user already exists
        var sql = "SELECT * from Users where email = $email"
        var qry = db.prepare(sql)
        qry.all({$email: email}, function(err, rows)
        {
          //if the email was already registered
          if(rows.length > 0)
            reject({Email: "Email address already registered!"})
          else
            fulfill()
        })
      })
      
      //result will be returned as a promise
      return new Promise(function(fulfill, reject)
      {
        var err = {}
        //validate parameters
        if(!email)
          err.Email = "Email not given."
        if(!password)
          err.Password = "Password not given."
        if(!name)
          err.Name = "Name not given."
        if(!phone)
          err.Phone = "Phone number not given."
        if(!isEmail(email))
          err.Email = "Invalid email."
        if(password.length < 5)
          err.Password ="Password did not meet minimum length of 5 characters."
        if(!PhoneFormat.isValidNumber(phone, "US"))
          err.Phone = "Not a valid US phone number."
          
        //if at least one error was detected
        if(Object.keys(err).length > 0)
        {
          reject(err)
          return      
        }
        
        //if all paremeters valid
        //format email
        email = email.toLowerCase()
        
        //check to see the email is not taken
        emailNotTaken
        .then(
          //if email not taken, add user
          function()
          {
            var sql = "INSERT INTO Users(email, password, name, phone) Values($email, $password, $name, $phone)"
            var qry = db.prepare(sql)
            var vars = 
            { 
              $email: email, 
              $password: md5(password), 
              $name: name,
              $phone: phone
            }
            qry.run(vars, function(err, row)
            {
              if(err)
                reject()
            })
          },
          //if the email was already taken
          function(err)
          {
            reject(err)
          }
        )
        //if added to the database successfully
        .then(
          function()
          {
            var sql = "SELECT * FROM Users WHERE password = $password and email = $email"
            var qry = db.prepare(sql)
            var vars = 
            {
              $email: email,
              $password: md5(password)
            }
            qry.all(vars, function(err, rows)
            { 
              if(err)
                reject(err)
              else if(rows.length != 1)
                reject("Failed to find newly created user.")
              else
              {
                var userRow = rows[0]
                //instantiate new user
                var user = new User(db, userRow)
                //add user to local collection
                Users[userRow.userId] = user
                fulfill(user)
              }
            })
          }
        )
      })
    }
    
    
    
    
    
    /* PRIVATE METHODS */
      
    //Goes through every file in the menus folder and loads
    //it into menusData
    function _loadVenders()
    {
      //instantiate variables local to function
      var tempData = []
      
      //loop through every file in the menus folder
      fs.readdir( menusFolder, function(err, files)
      {
        var pending = files.length
          
        //read each file
        files.map(function(file)
        {
          var filePath = menusFolder + file
          
          fs.readFile(filePath, 'utf8', function(err, data)
          {
            if(err)
              console.log("Failed to open menu: "+ err)
            else
            {
              //push the loaded data onto tempData
              try { tempData.push(JSON.parse(data)) }
              catch(err)
              {
                console.log("Failed to parse menu '"+ file + "': " + err)
              }
            }
            if(--pending <= 0)
              venderData = tempData
          })    
        }) 
        
      })
    }
    
    //loads the existing users from the database
    //adding new Users objects to Users[]
    function _loadUsers()
    {
      var sql = "select * from Users where 1"
      db.all(sql, function(err, rows)
      {
        if(rows)
        {
          rows.map(function(row)
          {
            var user = new User(db, row)
            Users[row.userId] = user
          })
        }
      })
    }
    
    //loads the existing orders from the database
    //adding new Order objects to Orders[]
    function _loadOrders()
    {
    }
    
    //Helper function handles all the code around preparing
    //the databaseversion file, and watching the Menus folder
    //to update the version when said folder is modified
    function _prepDatabaseVersion()
    {
      //set a new version of the database. A random number will
      //do fine here 9,999,999 times out of 10,000,000
      version = Math.random()*10000000
      version -= version % 1
      
      //watch the menus folder. If it changes,
      //reload the menus, and update the version
      fs.watch(menusFolder, function()
      {
        _loadVenders()
        version++
      })
    }
        
    
    //creates a random string of the given length
    function _randomString(length) 
    {
      var buf = []
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

      for (var i = 0; i < length; ++i) 
        buf.push(chars[_randomInt(0, chars.length - 1)])

      return buf.join('')
    }

    function _randomInt(min, max) 
    {
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
    
        
        
        
    /* CONSTRUCTOR */
    
    //generate local variables
    var serverFolder = require.toUrl("./server/")
    console.log("Server folder: " + serverFolder)
    var menusFolder =  serverFolder + "Menus/"
    var dbPath =  serverFolder + "Database.db"
    var version = -1
    var venderData = []
    var Users = []
    var Orders = []
    
    
    // Load required packages
    var fs = require('fs');  
    var sqlite = require("sqlite3").verbose()
    var _ = require("underscore")
    var Promise = require("promise")
    var md5 = require("MD5")
    var isEmail = require("validator").isEmail
    var util = require('util')
    
    
    //boot up database
    var db = new sqlite.Database(dbPath)
    //feed DB to order manager to boot it up
    var orderManager = OrderManager(db, this)
    
    
    //Instantiate tables if they do not yet exist
    db.run("CREATE TABLE IF NOT EXISTS Users(userId INTEGER PRIMARY KEY ASC, name TEXT, password TEXT, addressId INTEGER, email TEXT, phone TEXT, admin INTEGER DEFAULT 0, deliverer INTEGER DEFAULT 0, acceptingOrders INTEGER DEFAULT 0, available INTEGER DEFAULT 0, locked INTEGER DEFAULT 0)")
    db.run("CREATE TABLE IF NOT EXISTS Orders(orderId INTEGER PRIMARY KEY ASC, deliverer INTEGER DEFAULT -1, orderValue TEXT, stripeCharge TEXT, timeOrdered DATETIME DEFAULT CURRENT_TIMESTAMP, timePickedUp DATETIME, timeDelivered DATETIME, canceled TEXT)")
    db.run("CREATE TABLE IF NOT EXISTS Addresses(addressId INTEGER PRIMARY KEY ASC, userId INTEGER, address TEXT, instructions TEXT)")
    db.run("CREATE TABLE IF NOT EXISTS RememberMeTokens(tokenHash TEXT, userId INTEGER, timeOrdered DATETIME DEFAULT CURRENT_TIMESTAMP)")
    
    _prepDatabaseVersion()
    _loadVenders()
    _loadUsers()
    _loadOrders()
  }
  return Database
})
