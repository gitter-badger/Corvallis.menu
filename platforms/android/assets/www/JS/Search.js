//Client side of the Search page.
//Handles all of search's calls to the server,
//and creation of the Search page's <div>

define(["Ajax"], 
function(Ajax)
{
  /*
  function Search()
  { 
    
    //Required to inherit from class Page
    //This method defines a single pulse of the heartbeat.
    //Tells the server the client's version, and the server
    //responds with the updated database if desynced
    function _heartbeat()
    {
      //send ajax request to server
      Ajax.Get("SearchHeartbeat", {clientVersion: version}, function(response)
      {
        //if a response was given, parse it for its value
        if(response)
          response = JSON.parse(response)
        //if the parsed response has content
        if(response)
        {
          version = response.Version
          venders = response.VenderData
          if(ractive)
            ractive.set("venders", venders)
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
        el: "#searchPage",
        template: template,
        data:
        {
          Filter: _filter
        }
      })
      
      //if venders' data has been loaded, attach
      //it to ractive.
      ractive.set("venders", venders)  
      
      //attach SearchValue observer
      ractive.observe("SearchValue", function(newValue, oldValue)
      {
        //when SearchValue changes, 
        //make the filter execute on all items
        //refreshing the available items
        ractive.set("Filter", _filter)
      })
    }

    //This method filters items based on the 
    function _filter(item)
    {
      var searchValue = ractive.get("SearchValue")
      //define a quick function to see if a string compares another
      function containsSearchValue(str)
      {
        return str.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0
      }
      
      //if the name or description strings contain SearchValue, show this item
      if(item.Name && containsSearchValue(item.Name)) return true
      if(item.Description && containsSearchValue(item.Description)) return true
      
      return false
    }   
   
    //local variables
    //client's data version
    var version = -1 //instantiated as -1 to force an update
    var venders = []
    var ractive
    
    return{
      __proto__: Page("Client/HTML/Search.html", _attachRactive, _heartbeat)
    }
  }
  
  return Search
  */
})


