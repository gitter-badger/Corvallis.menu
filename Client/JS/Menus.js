exports = Search;

//Client side of the Search page.
//Handles all of search's calls to the server,
//and creation of the Search page's <div>
function Menus(cart)
{
  /* PRIVATE METHODS */
  
  //Required to inherit from class Page
  //This method defines a single pulse of the heartbeat.
  //Tells the server the client's version, and the server
  //responds with the updated database if desynced
  function _heartbeat()
  {
    //send ajax request to server
    $.get("SearchHeartbeat", {clientVersion: version}, function(response)
    {
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
        VenderIsOpen: _venderIsOpen
      }
    })
    
    //bind button clicks for item additions
    ractive.on("AddToCart", function(event, item, vender)
    {
      cart.AddToCart(item, vender)
    })
    
    //bind click for 
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
        
  //Checks to see whether the given vender is currently open
  function _venderIsOpen(vender)
  {
    var date = new Date()
    var currentDay = date.getDay()
    var now = date.getHours() + date.getMinutes()/60
    now = 12 //set now to noon for testing purposes
    
    //walk the open periods attempting to find the current one
    var currentOpenPeriod = vender.Hours[currentDay].find(function(openPeriod)
    {
      //get the start and end of the open period
      //default open to 0 if unprovided
      var open = openPeriod.Open ? openPeriod.Open : 0
      //default close to 24 if unprovided
      var close = openPeriod.Close ? openPeriod.Close : 24
      
      //if it is currently between open and close, return true
      //NOTE: Subtracted a half hour from close to give deliverers
      //time to get to the vender.
      if(now >= open && now <= close - .5)
        return true
        
      return false
    })
    
    //if a current open period was found, we are open
    return currentOpenPeriod != null
  }
  
  
  
  /* CONSTRUCTOR */ 
 
  //local variables
  //client's data version
  var version = -1 //instantiated as -1 to force an update
  var venders = []
  var ractive
  
  //Every minute, recalculate whether venders are open
  setInterval(function()
  {
    //set VenderIsOpen to itself, causing the UI to refresh
    if(ractive)
      ractive.set("VenderIsOpen", _venderIsOpen)
  }, 60000)
  
  
  return{
    __proto__: Page("Client/HTML/Menus.html", _attachRactive, _heartbeat)
  }
}


