//Client side Menus page.
//Handles creation of Menus and
//definition of their functionality

//define module for requirejs
define(function(require)
{  
  //gather required variables
  var VenderIsOpen = require("Shared/JS/VenderIsOpen")
  var Page = require("Client/JS/Page")
  
  function Menus(cart)
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
      $.get("SearchHeartbeat", {clientVersion: version}, function(response)
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
          ractive.set("Venders", venders)
        }
      });
    }
    
    
    //Required to inherit from class Page
    //This method initiates ractive
    //binding data and logic to the front end HTML
    function _attachRactive(template)
    {      
      //bind page to container
      ractive = new Ractive({
        el: "#menusPage",
        template: template,
        data: 
        {
          Venders: venders,
          VenderIsOpen: VenderIsOpen
        }
      })
      
      //bind button clicks for item additions
      ractive.on("AddToCart", function(event, item, vender)
      {
        cart.AddToCart(item, vender)
      })
      
      //bind toggle options button click
      ractive.on("ToggleOptions", function(event, item, vender)
      {
        //determine ractive's path to item.ShowOptions
        var showOptionsPath = "Venders["+vender+"].Items["+item+"].ShowOptions"
        //invert the current value of ShowOptions
        ractive.set(showOptionsPath, !ractive.get(showOptionsPath))
      })
      
      //bind a change in venders to an update in the jquery accordion
      //required to redraw ractive's newly created html
      ractive.observe("Venders", function(newValue, oldValue)
      {
        //recreate the accordion
        $("#accordion").accordion(
          {
            heightStyle: "content",
            collapsible: true
          })
      },
      { defer: true })    
    }
          
    
    
    
    
    /* CONSTRUCTOR */ 
   
    //local variables
    //client's data version
    var version = -1 //instantiated as -1 to force an update
    var venders = []
    var ractive
    var beatPending
    
    //Every minute, recalculate whether venders are open
    setInterval(function()
    {
      //set VenderIsOpen to itself, causing the UI to refresh
      if(ractive)
        ractive.set("VenderIsOpen", VenderIsOpen)
    }, 60000)
    
    
    return{
      __proto__: Page("Client/HTML/Menus.html", _attachRactive, _heartbeat)
    }
  }
  
  return Menus
})


