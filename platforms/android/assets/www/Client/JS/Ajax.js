
//Object used to abstract ajax calls
//so that they can be performed by either
//a phone application or a browser
define(["jquery"],
function($)
{
  var siteAddress = ""
  
  //if this is a phonegap app, we need to give
  //the explicit address of the web server.
  if(isPhonegapApp)
    var siteAddress = "73.11.87.192:3030/"
    
  function Post(filePath, data, response)
  {
    return $.post(siteAddress + filePath, data, response)
  }
  
  function Get(filePath, data, response)
  {
    return $.get(siteAddress + filePath, data, response)
  }
  
  return{
    Post: Post,
    Get: Get
  }
})