//Client side Menus page.
//Handles creation of Menus and
//definition of their functionality

//define module for requirejs
define(["Shared/JS/VenderIsOpen", "Client/JS/Page", "jquery", "Ajax"], 
function(VenderIsOpen, Page, $, Ajax)
{    
  function Menus()
  {
    /* PRIVATE METHODS */
    
    //Required to inherit from class Page
    //This method defines a single pulse of the heartbeat.
    //Tells the server the client's version, and the server
    //responds with the updated database if desynced
    function _heartbeat()
    {
      //don't send heartbeat if one is pending
      if(beatPending) return
      
      beatPending = true      
      //send ajax request to server
      Ajax.Get("SearchHeartbeat", {clientVersion: version}, function(response)
      {
        beatPending = false
        //if a response was given, parse it for its value
        if(response)
          response = JSON.parse(response)
        //if the parsed response has content
        if(response)
        {
          version = response.Version
          venders = response.VenderData
          if(ractive)
            ractive.set("Venders", venders)
        }
      });
    }
    
    
    //Required to inherit from class Page
    //This method initiate+s ractive
    //binding data and logic to the front end HTML
    function _attachRactive()
    {      
      //bind page to container
      component = Ractive.extend({
        template: Templates["Menus.html"],
        init: function()
        {
          ractive = this
          
          //bind button clicks for item additions
          this.on("*.AddToCart", function(event, item, vender)
          {
            this.get("Cart").AddToCart(item, vender)
          })
          
          this.on("*.ToggleShowOptions", function(event, item, vender)
          {
            var key = "Venders["+vender+"].Items["+item+"].ShowOptions"
            ractive.set(key, !ractive.get(key))
          })
        },
        data: 
        {
          Venders: venders,
          VenderIsOpen: VenderIsOpen
        }
      })
      
      Ractive.components.Menus = component
    }
          
    
    
    
    
    /* CONSTRUCTOR */ 
   
    //local variables
    //client's data version
    var version = -1 //instantiated as -1 to force an update
    var venders = []
    var component
    var ractive
    var beatPending
    
    _attachRactive()
    
    //Every minute, recalculate whether venders are open
    setInterval(function()
    {
      if(ractive)
        ractive.update("VenderIsOpen")
    }, 60000)
        
    return{
      __proto__: Page(_heartbeat)
    }
  }
  
  return Menus
})


