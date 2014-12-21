//This is the base class for all pages.
//PARAMETERS:
//  *REQUIRED*
//    TemplatePath:
//      Path to the template being ractive will use to make the page
//    attachRactive(template):
//      Function which will handle attaching ractive to the page.
//      This function should accept the template which will be loaded by page.
//  *OPTIONAL*
//    heartbeat:
//      The heartbeat for the page, syncing the server and client.
//      Turned on and off when the page is selected.
//    period:
//      Period in milliseconds of the heartbeat.

//define module for requirejs
define(function(require)
{

  function Page(templatePath, attachRactive, heartbeat, period)
  {
    /* PUBLIC METHODS */
    function Select()
    {
      _startHeartbeat()
    }
    
    function Unselect()
    {
      _stopHeartbeat()
    }
    
    /* PRIVATE METHODS */
    //Starts the hearbeat between the client and the server
    function _startHeartbeat()
    {
      //if no heartbeat has been specified, do nothing.
      if(!heartbeat){ return }
      
      //beat immediately forcing the database to update
      heartbeat()
      
      //start heartbeat
      heartbeatTimer = setInterval(heartbeat, period)
    }
    
    //Stops the heartbeat between the server and the client
    function _stopHeartbeat()
    {
      if(heartbeatTimer)
        clearInterval(heartbeatTimer);
    } 
    
    
    
    /* CONSTRUCTOR */ 
    
    //default period to a minute if value unspecified
    period = period ? period : 60000
    var heartbeatTimer
    
    //validate parameters
    if(!attachRactive)
      throw "Page missing parameter: AttachRactive"
    if(!templatePath)
      throw "Page missing parameter: TemplatePath"
    
    //load search page HTML template
    $.get(templatePath, function(response)
    {
      //if the template was retrieved
      if(response)
      {
        //attach ractive with the given template
        attachRactive(response)
      }
    })
    
    return{
      Select: Select,
      Unselect: Unselect 
    }
  }
  
  return Page
})