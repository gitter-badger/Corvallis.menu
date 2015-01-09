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
  requirejs(["Client/JS/Application", "cordova"], function(Application)
  {
    //boot up webapp
    var app = Application()
  })
}

/*
function gotFS(fileSystem) {
  fileSystem
        fs = fileSystem
        }
        
        
window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, null);
*/