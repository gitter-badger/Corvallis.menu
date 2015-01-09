//Admin page of the client
//define module for requirejs
define(["Client/JS/Page", "jquery"], 
function(Page, $)
{
  
  function Admin()
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
        template: Templates["Admin.html"],
        data:
        { 
        },
        init: function()
        {
          ractive = this
        }
      })
      
      
      Ractive.components.Admin = component
    }
    
    
    
    
    
    /* CONSTRUCTOR */ 
   
    
    //local variables
    var ractive
    _attachRactive()
    
    return{
      __proto__: Page()
    }
  }
  
  return Admin
})


