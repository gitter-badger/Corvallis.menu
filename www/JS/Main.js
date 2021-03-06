/* Entry point for the client */
var isPhonegapApp = document.URL.indexOf("http://") === -1 && document.URL.indexOf( 'https://' ) === -1

if(isPhonegapApp)
  document.addEventListener("deviceready", _startApp)

else
  _startApp()

function _startApp()
{
  //determine base url
  var baseUrl = "./../../"
  if(isPhonegapApp)
    baseUrl = "./"
    
  //configure requirejs
  requirejs.config(
  {
    //set base folder to root of server
    baseUrl: baseUrl,
    paths: 
    {
      underscore: "Shared/3rdParty/underscore-min",
      jquery: "Shared/3rdParty/jquery",
      Ajax: "JS/Ajax"
    }
  })
  
  //boot up requirejs loading the application component
  requirejs(["JS/Application"], function(Application)
  {
    //instantiate the application as a component
    //rooted at document.body
    new Ractive({
      el: document.body,
      template: "<Application/>"
    })
  })
}