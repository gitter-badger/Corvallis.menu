/* 
  The application
*/

//define for requirejs
define(function(require)
{
  //gather required variables
  var Page = require("Client/JS/Page")
  var Cart = require("Client/JS/Cart")
  var Menus = require("Client/JS/Menus")
  
  function Index()
  {
  
    function _attachRactive(template)
    {
      //bind page to container
      ractive = new Ractive({
        el: document.body,
        template: template
      })
    }
    
    
    
    /* CONSTRUCTOR */
    
    var ractive;
    
    //get the ractive HTML template
    $.getPromise("Client/HTML/Application.html").then(function(template)
    {
      //boot up ractive with the given template
      _attachRactive(template)
      
      //generate pages  
      var cartPage = Cart()
      $( "#cartPageLink" ).data(cartPage)
      ractive.set("Cart", cartPage)

      var menusPage = Menus(cartPage)
      $( "#menusPageLink" ).data(menusPage)
      //jquery will not call the Select method when the page loads.
      //The first tab which is selected needs to call .Select() to 
      //initiate contact with the server and populate data
      menusPage.Select() 
      ractive.set("Menus", menusPage)


      //create tabs
      $( "#tabs" ).tabs(
      {
        //Event handler called when a tab is selected
        activate: function(event, ui)
        {
          //get the Page classes attached to the tab
          var oldPage = ui.oldTab.data()
          var newPage = ui.newTab.data()
          
          oldPage.Unselect()
          newPage.Select()
        }
      })
      
    })
    
    return{
    }
  }
  
  return Index
})
  