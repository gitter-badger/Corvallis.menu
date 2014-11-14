exports = module.exports = Database;

function Database()
{
  //Public methods
  function GetVenderData(){ return venderData }
  function GetVersion(){ return version }

  //generate private functions
  var _execute = function(sql, callback)
  { 
    db.serialize(function()
      {
        var result = []
        db.each(sql, 
          //what to do with each row
          function(err, row){result.push(row);},
          //what to do upon completion
          function()
          {
            callback(result);
          });
      });
  }
  
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
  
  
  //itterates the version and saves the new value to the version file.
  var _itterateVersion = function()
  {
    version += 1;
    fs.writeFile(versionPath, version, function(err){});
  }
      
  
  // Load required packages
  var fs = require('fs');  
  var md5 = require('MD5')
  var sqlite = require("sqlite3").verbose()
  
  //generate local variables
  var versionPath = __dirname + "\\..\\..\\DatabaseVersion.txt"
  var menusFolder =  __dirname + "\\..\\Menus\\"
  var version = -1
  var dbPath =  __dirname + "\\..\\..\\Database.db"
  var venderData = []
  
  //boot up database
  var db = new sqlite.Database(dbPath)
  
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

  _loadVenders()
  
  //watch the menus folder. If it changes,
  //reload the menus, and update the version
  fs.watch(menusFolder, function()
  {
    //load menus then itterate version
    _loadVenders()
    _itterateVersion()
  })
  
  //Instantiate tables if they do not yet exist
  db.serialize(function()
  {
    db.run("CREATE TABLE IF NOT EXISTS Users(UserId INTEGER PRIMARY KEY ASC, Name TEXT, Address TEXT, Email TEXT, Phone INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS Venders(VenderId INTEGER PRIMARY KEY ASC, Name TEXT, PicturePath TEXT, Address TEXT, Phone TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS Items(ItemId INTEGER PRIMARY KEY ASC, VenderId INTEGER, Name TEXT, PicturePath TEXT, Description TEXT, Price REAL)");
  })
  
  //specify which variables/functions are public
  return{
    GetVenderData: GetVenderData,
    GetVersion: GetVersion
  }
}