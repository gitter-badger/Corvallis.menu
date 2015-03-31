//client side login component

//define module for requirejs
define(["jquery", "Ajax"], 
function($, Ajax)
{
  
  /* PUBLIC METHODS */
  function Login(event, email, password, rememberMe)
  {
    var loginComp = this
    //validate parameters
    var err = {}
    if(!email)
      err.Email = "Please enter email."
    if(!password)
      err.Password = "Please enter password."
    if(!rememberMe)
      rememberMe = false
    
    //if invalid parameters given
    if(Object.keys(err).length > 0)
    {
      loginComp.set("Err", err)
      return 
    }
    
    
    //Time to login.
    //disable any further attempts to login
    loginComp.set("Processing", true)
    
    //send ajax request to server
    var posting = Ajax.Post("Login", {email: email, password: password, rememberMe: rememberMe},
    function(response)
    {
      loginComp.set("Processing", false)
      
      
      response = JSON.parse(response)
      loginComp.set("Err", response.err)
      
      //This get call will make racitive find the
      //User data attached to the top of the application.
      //Without the get, set will not set the correct user variable.
      //This is more than a little troubling.
      loginComp.get("User") 
      loginComp.set("User", response.user)
    })
  }
  
   
  /* PRIVATE METHODS */
  function _loginClick(event)
  {    
    //collect required data for login
    var email = this.get("Credentials.Email")
    var password = this.get("Credentials.Password")
    var rememberMe = this.get("Credentials.RememberMe")
    this.fire("Login", false, email, password, rememberMe)
  }
  
  Ractive.components.Login  = Ractive.extend({
    template: Templates["Login.html"],
    data:
    { 
      Credentials: {},
      Processing: false,
      Err: false
    },
    init: function()
    {
      ractive = this
      
      this.on("LoginClick", _loginClick)
      this.on("Login", Login)
    }
  })
})


