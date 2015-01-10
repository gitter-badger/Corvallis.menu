//Client side Cart page.
//Handles all of cart's calls to the server,
//and creation of the cart page

//define module for requirejs
define(["Client/JS/Page", "jquery", "Ajax"], 
function(Page, $, Ajax)
{
  
  function Account()
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
        template: Templates["Account.html"],
        data:
        { 
        },
        init: function()
        {
          ractive = this
        }
      })
      
      
      Ractive.components.Account = component
    }
    
    
    
    
    
    /* CONSTRUCTOR */ 
   
    
    //local variables
    var ractive
    _attachRactive()
    
    return{
      __proto__: Page()
    }
  }
  
  return Account
})


