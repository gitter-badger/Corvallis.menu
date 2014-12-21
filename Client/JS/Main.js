/* Entry point for the client */

//teach jquery to execute .get() as a promise
$.getPromise = function(path)
{
  return new Promise(function(fulfill, reject)
  {
    $.get(path, function(response)
    {
      //if the response was retrieved
      if(response)
        fulfill(response)
      else 
        reject(path + " retrieved unsucessfully.")
    })
  })
}


//configure requirejs
requirejs.config(
{
  //set base folder to root of server
  baseUrl: "./../../",
  paths: {
    underscore: "Shared/3rdParty/underscore-min.js"
  }
});

//boot up requirejs
requirejs(["Client/JS/Application"], function(Application)
{
  //boot up webapp
  var app = Application()
})


