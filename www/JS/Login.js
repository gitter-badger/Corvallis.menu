//Client side login section

//define module for requirejs
define(["jquery", "Ajax"], 
function($, Ajax)
{
  /* PUBLIC METHODS */
  function Login(event, email, password, rememberMe)
  {
    //validate parameters
    var err = {}
    if(!email)
      err.Email = "Please enter email."
    if(!password)
      err.password = "Please enter password."
    if(!rememberMe)
      rememberMe = false
    
    //if invalid parameters given
    if(Object.keys(err).length > 0)
    {
      ractive.set(err, err)
      return 
    }
    
    
    //Time to login.
    //disable any further attempts to login
    ractive.set("Processing", true)
    
    //send ajax request to server
    var posting = Ajax.Post("Login", {email: email, password: password, rememberMe: rememberMe})
    posting.done(function(response)
    {
      ractive.set("Processing", false)
      
      //if login was unsuccessful
      if(!response.pkg)
        return
       
      var pkg = JSON.parse(response.pkg)
      
      
      ractive.set("Err", pkg.err)
      
      //This get call will make racitive find the
      //User data attached to the top of the application.
      //Without the get, set will not set the correct user variable.
      //This is more than a little troubling.
      ractive.get("User") 
      ractive.set("User", pkg.user)
    })
  }
  
   
  /* PRIVATE METHODS */
  function _loginClick(event)
  {
    var ractive = this
    
    //collect required data for login
    var email = ractive.get("Credentials.Email")
    var password = ractive.get("Credentials.Password")
    var rememberMe = ractive.get("Credentials.RememberMe")
    Login(false, email, password, rememberMe)
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


