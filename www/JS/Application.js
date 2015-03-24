/* 
  The application component
*/

//load required files and components
define(["jquery", "Ajax", 
"JS/Cart", "JS/Menus", "JS/Account", "JS/Register",
"JS/Login", "JS/Admin", "JS/Deliver/Deliver", "JS/TabsComponent"], 
function($, Ajax)
{
  Ractive.components.Application = Ractive.extend({
    template: Templates["Application.html"],
    css: css["Application.css"],
    data:
    {
      User: false
    },
    onrender: function()
    {
      //store the root of the application
      var applicationComp = this
      this.set("AppRoot", applicationComp)
      
      //if the user has the remember_me cookie set,
      //the initial interaction with the server will have
      //already resulted in a server-side login.
      //probe server for User information
      Ajax.Post("/GetUser", false, function(response)
      {
        if(!response)
          return
        
        response = JSON.parse(response)
        
        applicationComp.set("User", response.user)
      })
      
      //init event handlers
      this.on("*.LogoutClick", function(event)
      {
        Ajax.Get("/Logout")
        applicationComp.set("User", false)
      })
    }
  })
})
  