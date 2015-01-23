/* 
  The application
*/

//define for requirejs
define(["Ajax", "JS/Cart", "JS/Menus", "JS/Account", "JS/Register", 
"JS/TabsComponent", "JS/Login", "JS/Admin", "JS/Deliveries"], 
function(Ajax, Cart, Menus, Account, Register, TabsComp, Login, Admin, Deliveries)
{
  
  function Application()
  {  
    
    /* CONSTRUCTOR */
    
    //generate pages and their components  
    var cartPage = Cart()
    var menusPage = Menus()
    var accountPage = Account()
    var registerPage = Register()
    var loginPage = Login()
    var adminPage = Admin()
    var deliveriesPage = Deliveries()
    
    //boot up ractive with the given template
    var ractive = new Ractive({
      el: document.body,
      template: Templates["Application.html"],
      data:
      {
        //bind objects to the ractive instance
        //enabling page access anywhere within ractive
        Cart: cartPage,
        Menus: menusPage,  
        Account: accountPage,
        Register: registerPage,
        Login: loginPage,
        Admin: adminPage,
        Deliveries: deliveriesPage,
        User: false
      },
      init: function()
      {
        //store the root of the application
        this.set("RactiveRoot", this)
        
        //if the user has the remember_me cookie set,
        //the initial interaction with the server will have
        //already resulted in a server-side login.
        //
        //probe server for user info of this logged in client
        Ajax.Post("/GetUser", false, function(response)
        {
          if(!response.pkg)
            return
          
          var pkg = JSON.parse(response.pkg)
          
          ractive.set("User", pkg.user)
        })
      }
    })
    
    
    
    
    
    return{
    }
  }
  
  return Application
})
  