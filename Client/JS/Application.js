/* 
  The application
*/

//define for requirejs
define(["Client/JS/Cart", "Client/JS/Menus", "Client/JS/Account", "Client/JS/Register", "Client/JS/TabsComponent", "Client/JS/Login", "Client/JS/Admin"], 
function(Cart, Menus, Account, Register, TabsComp, Login, Admin)
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
        User: false
      }
    })
    
    
    return{
    }
  }
  
  return Application
})
  