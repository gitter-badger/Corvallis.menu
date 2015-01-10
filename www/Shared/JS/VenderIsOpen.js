//Checks to see whether or not the given vender is open for sales.

//define module for requirejs
define(function()
{
  //Helper method. Takes the given day as a string,
  //and returns what int value it has when returned 
  //by date.getDay()
  function _dayToInt(day)
  {
    if     (day.toLowerCase() === "sunday") return 0
    else if(day.toLowerCase() === "monday") return 1
    else if(day.toLowerCase() === "tuesday") return 2
    else if(day.toLowerCase() === "wednesday") return 3
    else if(day.toLowerCase() === "thursday") return 4
    else if(day.toLowerCase() === "friday") return 5
    else if(day.toLowerCase() === "saturday") return 6
    else throw "Could not parse day: " + day    
  }
  
  //calculates the integer time value of a moment
  function _calcTime(moment)
  {
    return _dayToInt(moment.Day) + moment.Time / 24
  }

  function VenderIsOpen(vender)
  {
    var date = new Date()
    var now = date.getDay() + (date.getHours() + date.getMinutes()/60)/24
    now = 1.5 //set now to noon on a monday for testing purposes
    
    for(i = 0; i < vender.OpenPeriods.length; i++)
    {
      //gather period's relevant data
      var period = vender.OpenPeriods[i]
      var open  = _calcTime(period.Open)
      var close = _calcTime(period.Close)
      
      //subtract a half hour from the closing time to ensure adequate delivery time
      close -= .5/24
      if( close < 0 ) close += 7
      
      //if now is inside of this open period
      if(now >= open && now <= close)
        return true      
    }
    
    //if none of the open periods contain 'now'
    return false
  }
  
  return VenderIsOpen
})