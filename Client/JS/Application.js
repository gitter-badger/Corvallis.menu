exports = Application;

/* Defines the clientside just2go application.
   All UI + functionality is inside the DIV
   returned by GetDiv */
function Application()
{ 
  //generate pages  
  var cartPage = Cart()
  $( "#cartPageLink" ).data(cartPage)
  
  var menusPage = Menus(cartPage)
  $( "#menusPageLink" ).data(menusPage)
  //jquery will not call the Select method when the page loads.
  //The first tab which is selected needs to be selected to 
  //initiate contact with the server and populate data
  menusPage.Select() 
  
  
  //create tabs
  $( "#tabs" ).tabs({
  
    //Event handler called when a tab is selected
    activate: function(event, ui){
      //get the Page classes attached to the tab
      var oldPage = ui.oldTab.data()
      var newPage = ui.newTab.data()
      
      oldPage.Unselect()
      newPage.Select()
    }
  })
  
  return{
  }
}

