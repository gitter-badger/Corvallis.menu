//Deliveries page of the client
//define module for requirejs
define(["JS/Page", "jquery", "Ajax"], 
function(Page, $, Ajax)
{
  
  function Deliveries()
  {
    /* PUBLIC METHODS */
    
    
     
    /* PRIVATE METHODS */
    
    //Required to inherit from class Page
    //This method initiates ractive
    //binding data and logic to the front end HTML
    function _attachRactive()
    {      
      //bind page to container
      var component = Ractive.extend({
      template: Templates["Deliveries.html"],
      data:
      { 
      },
      init: function()
      {
        ractive = this
        this.on("testButtonClick",
          function(event)
          {
            Ajax.Get("Test", null, function(response)
            {
              ractive.set("test", response)
            })
          })
        }
      })
      
      
      Ractive.components.Deliveries = component
    }
    
    
    
    
    
    /* CONSTRUCTOR */ 
   
    
    //local variables
    var ractive
    _attachRactive()
    
    return{
      __proto__: Page()
    }
  }
  
  return Deliveries
})


