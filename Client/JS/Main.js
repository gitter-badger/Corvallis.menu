/* Entry point for the client */

//configure requirejs
requirejs.config(
{
  //set base folder to root of server
  baseUrl: "./../../",
  paths: 
  {
    underscore: "Shared/3rdParty/underscore-min",
    jquery: "Shared/3rdParty/jquery"
  }
});

//boot up requirejs
requirejs(["Client/JS/Application"], function(Application)
{
  //boot up webapp
  var app = Application()
})


