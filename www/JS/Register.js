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
      var registerComp = this
      
      //collect required data for registration
      var email = registerComp.get("Credentials.Email")
      var name = registerComp.get("Credentials.Name")
      var password = registerComp.get("Credentials.Password")
      var phone = registerComp.get("Credentials.Phone")
      
      //Time to register the account.
      //disable any further attempts to register
      registerComp.set("Processing", true)
      
      //send ajax request to server
      var posting = Ajax.Post("RegisterUser", {email: email, password: password, name: name, phone: phone})
      posting.done(function(response)
      {
        registerComp.set("Processing", false)
        //if a response was given, parse it for its value
        if(response)
          response = JSON.parse(response.pkg)
        //if the parsed response has content
        registerComp.set("Err", response.err)
	
        //if the user was successfully created
        if(response.user)
        {
          registerComp.get("User")
          registerComp.set("User", response.user)
          
          //select menus page          
          var ractive = registerComp.get("RactiveRoot")
          ractive.findAllComponents("TabsLink")
            .filter(function(link){ return link.get("PaneId") == "menusPane"})
            .map(function(link){ link.fire("Select") })
        }
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
          Credentials: {},
          Processing: false,
          Err: false
        },
        init: function()
        {          
          this.on("RegisterClick", _register)
        }
      })
      
      Ractive.components.Register = component
    }
    
    
    
    
    
    /* CONSTRUCTOR */ 
   
    
    //local variables
    var application
    _attachRactive()
    
    return{
      __proto__: Page()
    }
  }
  
  return Register
})


