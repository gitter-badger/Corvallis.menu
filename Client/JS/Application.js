/* 
  The application
*/

//define for requirejs
define(["Client/JS/Page", "Client/JS/Cart", "Client/JS/Menus", "Client/JS/TabsComponent"], 
function(Page, Cart, Menus)
{
  
  function Application()
  {  
    
    /* CONSTRUCTOR */
    
    //generate pages and their components  
    var cartPage = Cart()
    var menusPage = Menus(cartPage)
    
    //boot up ractive with the given template
    var ractive = new Ractive({
        el: document.body,
        template: Templates["Application.html"]
      })
    
    ractive.set("Cart", cartPage)
    ractive.set("Menus", menusPage)  
    
    return{
    }
  }
  
  return Application
})
  