//Client side Cart page.
//Handles all of cart's calls to the server,
//and creation of the cart page

//define module for requirejs
define(["JS/Page", "jquery", "Ajax"], 
function(Page, $, Ajax)
{
  
  function Account()
  {
    /* PUBLIC METHODS */
    
    
     
    /* PRIVATE METHODS */
    
    
    
    
    /* CONSTRUCTOR */ 
   
    
    //local variables
    var ractive
    
    //bind page to container
    Ractive.components.Account = Ractive.extend({
      template: Templates["Account.html"],
      data:
      { 
      },
      init: function()
      {
        ractive = this
      }
    })
    
    return{
      __proto__: Page()
    }
  }
  
  return Account
})


