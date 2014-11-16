exports = module.exports = Database;

function Database()
{
  //Public methods
  function GetVenderData(){ return venderData }
  function GetVersion(){ return version }

  //Takes an order and validates it against the local database,
  //removing any properties that should not exist, and ensuring that
  //items properties 
  function ValidateOrder(order)
  {
    //generate helper method used repeatedly in this function.
    //Compares the local and order objects, ensuring they are not too different.
    //Returns boolean value reflecting whether or not the order object seems valid.
    function compareObjects(local, order)
    {
      for(var prop in local)
      {
        //skip arrays
        if(Object.prototype.toString.call(local[prop]) === '[object Array]')
          continue
         
        if(!order.hasOwnProperty(prop))
        {
          console.log("Order object missing property from local database: " + prop)
          return false
        }
          
        //if the properties differ, 
        if(order[prop] != local[prop])
        {
          console.log("Order object property did not match local database: " + prop)
          return false
        }
      }        
      return true
    }
    
    //ensure Items sent
    if(!order.Items)
    {
      console.log("Received order missing 'Items' property.")
      return false
    }
     
    //ensure Vender sent
    if(!order.Vender)
    {
      console.log("Received order missing 'Vender' property.")
      return false
    }
  
    //trim items options to only the selected ones
    order.Items.forEach(function(item)
    {
      item.Options = item.Options.find(function(itemOption)
      {
        //for each order.Item.Option.Option
        itemOption.Options = itemOption.Options.find(function(optionOption)
        {
          return optionOption.Selected
        })
        
        //if no options selected, delete this item option
        return itemOption.Options
      })
    })
    
    //Get corresponding order vender from local database
    var localVender = GetVenderData().find(function(vender)
    {
      return vender.Name && vender.Address == order.Vender.Address && vender.Name == order.Vender.Name
    })
    
    //if no corresponding venders found
    if(!localVender || localVender.length > 1)
    {
      console.log("Failed to isolate corresponding vender for given Order.")
      return false
    }
    
    //ensure properties of order.Vender and local vender do not differ
    if( !compareObjects(localVender, order.Vender))
      return false
    
    //ensure each item in the order matches with Server item data
    for(var itemIndex = 0; itemIndex < order.Items.length; itemIndex++)
    {
      orderItem = order.Items[itemIndex]
      
      //get corresponding item in local storage
      var localItem = localVender.Items.find(function(item)
      {
        return item.Name == orderItem.Name && item.Price == orderItem.Price
      })
      
      //ensure item found
      if(!localItem || localItem.length > 1)
      {
        console.log("Could not locate ordered item in local database: " + orderItem.Name)
        return false
      }
      
      //ensure local item properties and order item properties do not differ
      if(!compareObjects(localItem, orderItem))
        return false
        
      //loop through item options ensuring they exist in local database
      _.each(orderItem.Options, function(orderOption)
      {
        //find corresponding local option
        var localOption = localItem.Options.find(function(option)
        {
          return option.Name == orderOption.Name && option.Type == orderOption.Type
        })
        
        //ensure option found
        if(!localOption || localOption.length > 1)
        {
          console.log("Could not locate item option in local database: " + localOption.Name)
          return false
        }
        
        //compare options
        if(!compareObjects(localOption, orderOption))
          return false
          
        
        console.log(orderOption.Name)
      })    
    }
    
    
    return true
  }
  
  
  /* PRIVATE METHODS */
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
      
      
      
      
      
      
      
      
      
  /* CONSTRUCTOR */
  
  // Load required packages
  var fs = require('fs');  
  var sqlite = require("sqlite3").verbose()
  var _ = require("underscore")
  
  //generate local variables
  var root = __dirname + "\\..\\..\\"
  var versionPath = root + "DatabaseVersion.txt"
  var menusFolder =  root + "server\\Menus\\"
  var dbPath =  root + "Database.db"
  var version = -1
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
    GetVersion: GetVersion,
    ValidateOrder: ValidateOrder
  }
}