exports = module.exports = Database;

function Database()
{
  //Public methods
  function GetVenderData(){ return venderData }
  function GetVersion(){ return version }

  //Processes the given order, validating
  function ProcessOrder(order)
  {
    //trim unselected properties from the order
    _trimUnselected(order)
    //attempt to validate the order
    if(!_validateOrder(order))
      return false
      
    //calculate order price
    order.Price = calcOrderPrice(order.Items)
    
    //return that the order was successfully processed
    return true
  }
  
  /* PRIVATE METHODS */
  function _execute(sql, callback)
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
  
  function _trimUnselected(order)
  {
    //trim items options to only the selected ones
    order.Items.forEach(function(item)
    {
      item.Addons = item.Addons.find(function(addon)
      {
        //for each order.Item.Option.Option
        addon.Options = addon.Options.find(function(option)
        {
          return option.Selected
        })
        
        //if no options selected, delete this item option
        return item.Addons.Options
      })
    })
  }
  
  function _acceptOrder(order, user)
  {
    //Once the order has been accepted, charge the user
    stripe.charges.create(
    {
      amount: price,
      currency: "usd",
      card: order.Token,
      description: "Charge for order at Corvallis.Menu"
    }, function(err, charge)
    {
    })
  }
  
  //Takes an order and validates it against the local database.
  //Removes all nonselected items/options. Ensures 
  function _validateOrder(order)
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
         
        //skip "selected" prop which may be defaulted to false
        if(prop.toLowerCase() === "selected")
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

      //Since we base all pricing off the Price value,
      //we want to make sure the Order doesn't have a Price that
      //doesn't exist in the local database. Prevents overcharging.
      if(order.Price && order.Price != local.Price)
      {
        console.log("Order contained Price property that did not exist in the local database.")
        return false
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
    
    //ensure token sent
    if(!order.Token)
    {
      console.log("Recieved order missing 'Token' property.")
    }
    
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
    
    //before we start validating, check to see that the vender is open
    if(!venderIsOpen(localVender))
    {
      console.log("Received order for closed vender.")
      return false
    }
    
    //ensure properties of order.Vender and local vender do not differ
    if( !compareObjects(localVender, order.Vender))
      return false
    
    //ensure each item in the order matches with Server item data
    _.each(order.Items, function(orderItem)
    {      
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
        
      //loop through item.Addons ensuring they exist in local database
      _.each(orderItem.Addons, function(orderAddon)
      {
        //find corresponding local addon
        var localAddon = localItem.Addons.find(function(addon)
        {
          return addon.Name == orderOption.Name && addon.InputType == orderOption.InputType
        })
        
        //ensure addon found
        if(!localAddon || localAddon.length > 1)
        {
          console.log("Could not locate item addon in local database: " + orderAddon.Name)
          return false
        }
        
        //compare addons
        if(!compareObjects(localAddon, orderAddon))
          return false
          
        //loop through options
        _.each(orderAddon.Options, function(orderOption)
        {
          //find corresponding local option
          var localOption = localAddon.find(function(option)
          {
            return option.Name == orderOption.Name && option.Price == orderOption.Price
          })
          
          //ensure correct option found
          if(!localOption || localOption.length > 1)
          {
            console.log("Could not locate addon option in local database: " + orderOption.Name)
            return false
          }
          
          //compare options
          if(!compareObjects(localOption, orderOption))
            return false
        })
      })    
    })
    
    //Validation successful.
    return order
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
      
        
  function _heartbeat()
  {
    
  }
      
  function _findDeliverer()
  {
    //find available employee
    twilioClient.sms.messages.create(
    {
      to: "15039410828", //"(541) 255-4410"
      from: "5412554410",
      body: "Message goes here pls"
    },
    function(error, message)
    {
      if(error)
      {
        console.log("Twilio failed to deliver message: " + error)
        return
      }
      
    })
  }  
      
      
      
  /* CONSTRUCTOR */
  
  // Load required packages
  var fs = require('fs');  
  var sqlite = require("sqlite3").verbose()
  var _ = require("underscore")
  var twilio = require("twilio")
  var sharedJsDir = "./../../Shared/JS/"
  var venderIsOpen = require(sharedJsDir + "VenderIsOpen.js")
  var calcOrderPrice = require(sharedJsDir + "CalcOrderPrice.js")
  var stripe = require("stripe")("sk_test_xPKZSx74LUGSJUmmrwpRGwki")
  
  //generate local variables
  var twilioClient = "TODO:FIX"//new twilio.ResetClient("AC952dab6ac06e4d2e0c7f13280deae972", "9073ee8c4f4cab08c3bf76a423da2dbb")
  var root = __dirname + "/../../"
  var versionPath = root + "DatabaseVersion.txt"
  var menusFolder =  root + "server/Menus/"
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
    db.run("CREATE TABLE IF NOT EXISTS Users(userId INTEGER PRIMARY KEY ASC, name TEXT, address TEXT, email TEXT, phone TEXT)")
    db.run("CREATE TABLE IF NOT EXISTS Orders(orderId INTEGER PRIMARY KEY ASC, deliverer INTEGER DEFAULT -1, value BLOB, timeOrdered TEXT, timePickedUp TEXT, timeDelivered TEXT)")
  })
  
  //specify which variables/functions are public
  return{
    GetVenderData: GetVenderData,
    GetVersion: GetVersion,
    ProcessOrder: ProcessOrder
  }
}