//Client side Menus page.
//Handles creation of Menus and
//definition of their functionality

//define module for requirejs
define(["Shared/JS/VenderIsOpen", "jquery", "Ajax"], 
function(VenderIsOpen, $, Ajax)
{    
  //Required to inherit from class Page
  //This method defines a single pulse of the heartbeat.
  //Tells the server the client's version, and the server
  //responds with the updated database if desynced
  function _heartbeat(menusComp)
  {
    //don't send heartbeat if one is pending
    if(menusComp.get("beatPending")) return
    
    menusComp.set("beatPending", true)      
    //send ajax request to server
    Ajax.Get("SearchHeartbeat", {clientVersion: menusComp.get("version")}, function(response)
    {
      menusComp.set("beatPending", false)
      //if a response was given, parse it for its value
      if(response)
        response = JSON.parse(response)
      //if the parsed response has content
      if(response)
      {
        menusComp.set("Version", response.Version)
        menusComp.set("Venders", response.VenderData)
      }
    })
  }
  
  
  Ractive.components.Menus = Ractive.extend({
    template: Templates["Menus.html"],
    init: function()
    {
      menusComp = this
      
      //Every minute, recalculate whether venders are open
      setInterval(function()
      {
        if(menusComp)
          menusComp.update("VenderIsOpen")
      }, 60000)
      
      //every minute, check to see if the available menus have changed.
      heartbeatTimer = setInterval(_heartbeat, 60000, menusComp)
      //do the initial pulse
      _heartbeat(menusComp)
          
      //bind button clicks for item additions
      this.on("*.AddToCart", function(event, item, vender)
      {
        this.get("AppRoot")
          .findComponent("Cart")
          .fire("AddToCart", event, item, vender)
      })
      
      this.on("*.ToggleShowOptions", function(event, item, vender)
      {
        var key = "Venders["+vender+"].Items["+item+"].ShowOptions"
        menusComp.set(key, !menusComp.get(key))
      })
    },
    data: 
    {
      Venders: [],
      Version: -1,
      VenderIsOpen: VenderIsOpen
    }
  })
})


