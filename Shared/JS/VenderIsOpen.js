if(typeof exports !== "undefined")
  exports = VenderIsOpen
if(typeof module !== "undefined")
  module.exports = VenderIsOpen

//Checks to see whether the given vender is currently open
function VenderIsOpen(vender)
{
  var date = new Date()
  var currentDay = date.getDay()
  var now = date.getHours() + date.getMinutes()/60
  now = 12 //set now to noon for testing purposes
  
  /* TODO: FIX THIS. Stores that are open past midnight
           will currently cut users off from purchasing at 11:30
           then reopen at midnight.*/
  //walk the open periods attempting to find the current one
  var currentOpenPeriod = vender.Hours[currentDay].find(function(openPeriod)
  {
    //get the start and end of the open period
    //default open to 0 if unprovided
    var open = openPeriod.Open ? openPeriod.Open : 0
    //default close to 24 if unprovided
    var close = openPeriod.Close ? openPeriod.Close : 24
    
    //if it is currently between open and close, return true
    //NOTE: Subtracted a half hour from close to give deliverers
    //time to get to the vender.
    if(now >= open && now <= close - .5)
      return true
      
    return false
  })
  
  //if a current open period was found, we are open
  return currentOpenPeriod != null
}