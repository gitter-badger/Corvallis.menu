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
      jquery: "Shared/3rdParty/jquery"
    }
  });

  //boot up requirejs

  requirejs(["Shared/3rdParty/phonegapApp", "Client/JS/Application"], function(phonegapApp, Application)
  {
    //boot up webapp
    var app = Application()
  })
}
