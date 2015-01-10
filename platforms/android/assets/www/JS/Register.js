//Client side Cart page.
//Handles all of cart's calls to the server,
//and creation of the cart page

//define module for requirejs
define(["JS/Page", "jquery", "Ajax"], 
function(Page, $, Ajax)
{
  
  function Register()
  {
    /* PUBLIC METHODS */
    
    
     
    /* PRIVATE METHODS */
    
    function _register(event)
    {
      var ractive = this
      
      //collect required data for registration
      var email = ractive.get("User.Email")
      var name = ractive.get("User.Name")
      var password = ractive.get("User.Password")
      var phone = ractive.get("User.Phone")
      
      //Time to register the account.
      //disable any further attempts to register
      ractive.set("Processing", true)
      
      //send ajax request to server
      var posting = Ajax.Post("RegisterUser", {pkg: JSON.stringify({email: email, password: password, name: name, phone: phone})})
      posting.done(function(response)
      {
        ractive.set("Processing", false)
        //if a response was given, parse it for its value
        if(response)
          response = JSON.parse(response.pkg)
        //if the parsed response has content
        ractive.set("Err", response.err)
      })
    }
    
    //Required to inherit from class Page
    //This method initiates ractive
    //binding data and logic to the front end HTML
    function _attachRactive()
    {      
      //bind page to container
      var component = Ractive.extend({
        template: Templates["Register.html"],
        data:
        { 
          User: {},
          Processing: false,
          Err: false
        },
        init: function()
        {
          ractive = this
          
          this.on("RegisterClick", _register)
        }
      })
      
      Ractive.components.Register = component
    }
    
    
    
    
    
    /* CONSTRUCTOR */ 
   
    
    //local variables
    var ractive
    _attachRactive()
    
    return{
      __proto__: Page()
    }
  }
  
  return Register
})


