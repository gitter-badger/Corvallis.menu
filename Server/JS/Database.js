exports = module.exports = Database;

function Database()
{
  /* PUBLIC METHODS */
  function GetVenderData(){ return venderData }
  function GetVersion(){ return version }

  //Processes the given order, validating it,
  //and adding it to the local database
  function ProcessOrder(order)
  {
    return orderManager.ProcessOrder(order) 
  }
  
  
  //Attempts to login the user with the given email and password.
  function LoginUser(email, password)
  {
    return new Promise(function(reject, fulfill)
    {
      //get user from database
      var sql = "select userId from Users where email = $email and password = $password"
      var qry = db.prepare(sql)
      var vars = 
      {
        $email: email,
        $password: md5(password)
      }
      qry.run(vars, function(err)
      {
        if(err)
          reject(err)
        else
          fulfill()
      })
    })
  }
  
  function CreateUser(email, passsword, name)
  {
    return new Promise(function(reject, fulfill)
    {
      var sql = "INSERT INTO Users(email, password, name) Values($email, $password, $name)"
      var qry = db.prepare(sql)
      var vars = 
      { 
        $email: email, 
        $password: md5(password), 
        $name: name 
      }
      qry.run(vars, function(err)
      {
        if(err)
          reject(err)
        else
          fulfill()
      })
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
      files.forEach(function(file)
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
    return new Promise(function(fulfill, reject)
    {
      var users = []
      var sql = "select * from Users where 1"
      db.each(sql, {}, function(err, row)
      {
        if(err)
          reject(err)
        users[row.userId] = new User(row)
      },
      function()
      {
        fulfill(users)
      })
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
    //ensure database version file exists
    fs.exists(versionPath, function(exists)
    {
      //if the file does not exist, create it with the Itterate function
      if(!exists){ _itterateVersion(); }
    })
    
    //load current database version
    fs.readFile(versionPath, 'utf8', function(err, data)
    {
      if(err)
      {
        console.log("Failed to load database version!");
      }
      version = parseInt(data);
    })
    
    
    //watch the menus folder. If it changes,
    //reload the menus, and update the version
    fs.watch(menusFolder, function()
    {
      //load menus then itterate version
      _loadVenders()
      _itterateVersion()
    })
  }
  
  //itterates the version and saves the new value to the version file.
  var _itterateVersion = function()
  {
    version += 1;
    fs.writeFile(versionPath, version, function(err){});
  }
      
      
      
      
      
      
  /* CONSTRUCTOR */
  
  // Load required packages
  var fs = require('fs');  
  var sqlite = require("sqlite3").verbose()
  var _ = require("underscore")
  var requirejs = require("requirejs")
  var Promise = require("promise")
  var User = require("./User.js")
  var md5 = require("MD5")
  
  var OrderManager = requirejs("Server/JS/OrderManager")
  
  
  //generate local variables
  var root = __dirname + "/../../"
  var versionPath = root + "DatabaseVersion.txt"
  var menusFolder =  root + "server/Menus/"
  var dbPath =  root + "Database.db"
  var version = -1
  var venderData = []
  var Users = []
  var Orders = []
  
  
  //boot up database
  var db = new sqlite.Database(dbPath)
  //feed DB to order manager to boot it up
  var orderManager = OrderManager(db, GetVenderData)
  
  //teach database to query
  db.query = function(sql)
  {
    return new Promise(fulfill, reject)
    {
      var result = []
      db.each(sql, 
        //what to do with each row
        function(err, row)
        {
          if(err)
            reject(err)
          result.push(row);
        },
        //what to do upon completion
        function()
        {
          fulfill(result);
        });
    }
  }
  
  _prepDatabaseVersion()
  _loadVenders()
  _loadUsers().then(Users.push)
  _loadOrders()
  
  //Instantiate tables if they do not yet exist
  db.run("CREATE TABLE IF NOT EXISTS Users(userId INTEGER PRIMARY KEY ASC, name TEXT, addressId INTEGER, email TEXT, phone TEXT, admin INTEGER DEFAULT 0, employee INTEGER DEFAULT 0, acceptingOrders INTEGER DEFAULT 0)")
  db.run("CREATE TABLE IF NOT EXISTS Orders(orderId INTEGER PRIMARY KEY ASC, deliverer INTEGER DEFAULT -1, orderValue TEXT, stripeCharge TEXT, timeOrdered DATETIME DEFAULT CURRENT_TIMESTAMP, timePickedUp DATETIME, timeDelivered DATETIME, status TEXT DEFAULT \"new\")")
  db.run("CREATE TABLE IF NOT EXISTS Addresses(addressId INTEGER PRIMARY KEY ASC, userId INTEGER, address TEXT, instructions TEXT)")
  
  //specify which variables/functions are public
  return{
    GetVenderData: GetVenderData,
    GetVersion: GetVersion,
    ProcessOrder: ProcessOrder,
    LoginUser: LoginUser,
    CreateUser: CreateUser
  }
}