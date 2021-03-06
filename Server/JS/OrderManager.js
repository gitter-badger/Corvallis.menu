//Class used to abstract handling of orders by the server.
//Used to process/validate new orders, adding them to the DB;
//and to automatically assign orders to employees
define(["Server/js/Order", "www/Shared/JS/VenderIsOpen", "www/Shared/JS/CalcOrderPrice", "Keys"],
function(Order, venderIsOpen, calcOrderPrice, Keys)
{  
  function OrderManager(db, database)
  { 
    /* CONSTRUCTOR */
    
    //gather local variables
    var stripe = require("stripe")(Keys.StripeTestKey)
    var Promise = require("promise")
    var twilioClient = "TODO:FIX"//new twilio.ResetClient("asdf","asdf")
    var twilio = require("twilio")
    var _ = require("underscore")
    var orders = []
    
    
    
    /* PUBLIC METHODS */
    function GetOrderById(id)
    {
      return orders[id]
    }
    
    //Processes the given order, validating it,
    //and adding it to the local database.
    //Executes the given callback with the results
    function ProcessOrder(order)
    {
      //get token from order
      var token = order.Token
      //trim token from order
      delete order.Token
      
      //trim unselected properties from the order.
      _trimUnselected(order)
      //calculate order price and add it to the object
      order.Price = calcOrderPrice(order.Items)
      
      return new Promise(function(fulfill, reject)
      {
        _validateOrder(order)
          //then create stripe charge
          .then(function(){ return _createStripeCharge(token, order.Price) })
          //then add order to database
          .then(function(stripeResponse) { return _addOrderToDatabse(order, stripeResponse.id) })
          .then(
            function(orderRow)
            { 
              var order = new Order(orderRow, db)
              orders[orderRow.orderId] = order
              fulfill(order)
            },
            function(err)
            {
              reject(err)
            })
      })
    }
    
    
    
    /* PRIVATE METHODS */
    
    //Trims unselected items from order,
    //reducing the order to just the purchased objects
    function _trimUnselected(order)
    {
      //trim items options to only the selected ones
      order.Items = _.filter(order.Items, function(item)
      {
        //if the item is selected, and contains addons,
        //trim the addons to the selected ones
        if(item.Addons && item.Selected)
        {
          item.Addons = _.filter(item.Addons, function(addon)
          {
            //skip any addon that has no options
            if(!addon.Options) return false
            
            //for each order.Item.Addon.Option
            addon.Options = _.filter(addon.Options, function(option)
            {
              return option.Selected
            })
            
            //if no options selected, delete this addon
            return addon.Options.length > 0
          })
        }
        
        //return whether or not this item was selected
        return item.Selected
      })
    }
    
    
    //Takes an order and validates it against the local database.
    //
    //returns true if the order is valid
    function _validateOrder(order)
    {
      return new Promise(function(fulfill, reject)
      {    
        //ensure Items sent
        if(!order.Items)
        {
          reject("Received order missing 'Items' property.")
          return
        }
         
        //ensure Vender sent
        if(!order.Vender)
        {
          reject("Received order missing 'Vender' property.")
          return 
        }
        
        //Get corresponding order vender from local database
        var localVender = database.GetVenderData().find(function(vender)
        {
          return vender.Name && vender.Address == order.Vender.Address && vender.Name == order.Vender.Name
        })
        
        //if no corresponding venders found
        if(!localVender)
        {
          reject("Failed to isolate corresponding vender for given Order.")
          return
        }
        
        //before we start validating, check to see that the vender is open
        if(!venderIsOpen(localVender))
        {
          reject("Received order for closed vender.")
          return
        }
        //ensure properties of order.Vender and local vender do not differ
        if(!_compareObjects(localVender, order.Vender))
          return false
        
        //ensure each item in the order matches with Server item data
        order.Items.map(function(orderItem)
        {      
          //get corresponding item in local storage
          var localItem = localVender.Items.find(function(item)
          {
            return item.Name == orderItem.Name && item.Price == orderItem.Price
          })
          
          //ensure item found
          if(!localItem || localItem.length > 1)
          {
            reject("Could not locate ordered item in local database: " + orderItem.Name)
            return
          }
          
          //ensure local item properties and order item properties do not differ
          if(!_compareObjects(localItem, orderItem))
          {
            reject("Item properties differed from local database: " + item.Name)
            return
          }
            
          //loop through item.Addons ensuring they exist in local database
          orderItem.Addons.map(function(orderAddon)
          {
            //find corresponding local addon
            var localAddon = localItem.Addons.find(function(addon)
            {
              return addon.Name == orderAddon.Name && addon.InputType == orderAddon.InputType
            })
            
            //ensure addon found
            if(!localAddon || localAddon.length > 1)
            {
              reject("Could not locate item addon in local database: " + orderAddon.Name)
              return 
            }
            
            //compare addons
            if(!_compareObjects(localAddon, orderAddon))
            {
              reject("Addon properties differed from local database" + addon.Name)
              return
            }
              
            //loop through options
            orderAddon.Options.map(function(orderOption)
            {
              //find corresponding local option
              var localOption = localAddon.Options.find(function(option)
              {
                return option.Name == orderOption.Name && option.Price == orderOption.Price
              })
              
              //ensure correct option found
              if(!localOption || localOption.length > 1)
              {
                reject("Could not locate addon option in local database: " + orderOption.Name)
                return
              }
              
              //compare options
              if(!_compareObjects(localOption, orderOption))
              {
                reject("Option differed in properties from local database: "+ orderOption.Name)
                return false
              }
            })
          })    
        })
        
        //Validation successful.
        fulfill()
      }) 
    }
    
    //Compares the local and order objects, ensuring they do not differ in properties.
    //
    //Returns true if order object is valid
    function _compareObjects(local, order)
    {
      for(var prop in local)
      {
        //skip arrays
        if(Object.prototype.toString.call(local[prop]) === '[object Array]')
          continue
         
        //skip "selected" prop which may be defaulted to false
        if(prop.toLowerCase() === "selected")
          continue
          
        if(order.hasOwnProperty(prop) == false)
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
    
    
    //creates a stripe charge for the given token
    //at the given price. Expects the price to be in dollars;
    //if trying to charge $5.25, price = 5.25
    function _createStripeCharge(token, price)
    {
      return new Promise(function(fulfill, reject)
      {
        stripe.charges.create(
        {
          amount: price*100,
          currency: "usd",
          card: token,
          description: "Charge for order at Corvallis.Menu",
          //Capture is set as false here to prevent any
          //charges from going through immediately.
          //This gives us the window to use Square,
          //then charge with stripe if the customer
          //cannot use square or is unreachable
          capture: false, 
        }, function(err, charge)
        {
          //if the charge creation failed
          if(err)
            reject(err)
          //else if the charge could not be paid
          else if(!charge.paid)
            reject("Charge could not be funded.")
          //charge was successful.
          else
            fulfill(charge)
        })
      })
    }
    
    //completes a stripe charge, moving money 
    function _completeStripeCharge(charge)
    {
      return new Promise(function(fulfill, reject)
      {
        stripe.charges.capture(charge, function(err, charge)
        {
          if(err)
          {
            console.log("Failed to complete stripe charge: "+err)
            reject(err)
          }
          else if(!charge.paid)
          {
            reject("Completed charge was not paid?")
          }
          else
          {
            console.log("Stripe successfully completed the charge.")
            fulfill(charge)
          }
        })
      })
    }
    
    //takes the given order and stripe ID, and
    //creates a new order in the Orders table.
    function _addOrderToDatabse(order, stripeId)
    {
      return new Promise(
        function(fulfill, reject)
        {
          //Add the order to the database
          var qry = db.prepare("INSERT INTO Orders(orderValue, stripeCharge) Values($orderValue, $stripeToken)")
          var vars = { $orderValue: JSON.stringify(order), $stripeToken: stripeId }
          qry.run(vars, function(err)
          {
            if(err)
              reject(err)
            else
              fulfill()
          })  
        })
        //get the new order and return it
        .then(function(){ return _getOrderFromDatabase(stripeId) })
    }
    
    //gets an order from the database 
    function _getOrderFromDatabase(stripeCharge)
    {
      return new Promise(
        function(fulfill, reject)
        {
          var qry = db.prepare("SELECT * FROM Orders WHERE stripeCharge = $stripeCharge")
          var vars = 
          {
            $stripeCharge: stripeCharge
          }
          qry.get(vars, function(err, row)
          { 
            if(err)
              reject(err)
            else if(!row)
              reject("Order not returned from query.")
            else
              fulfill(row)
          })
        }
      )
    }
    
    
    //uses twillio to send a text message to the given phone number
    function _textMessage(number, message)
    {
      //find available employee
      twilioClient.sms.messages.create(
      {
        to: number, //"(541) 255-4410"
        from: "5412554410",
        body: message
      },
      function(error, message)
      {
        if(error)
        {
          console.log("Twilio failed to deliver text message: " + error)
          return
        }      
      })
    }  
    
    
    return{
      ProcessOrder: ProcessOrder
    }
  }
  
  return OrderManager
})