//define module for requirejs
define(["jquery", "Ajax", "Shared/JS/CalcDistance"], 
function($, Ajax, CalcDistance)
{
  Ractive.components.ClockIn = Ractive.extend({
    template: Templates["Deliver/ClockIn.html"],
    data: 
    {
      CalcDistance: CalcDistance,
      Location: false,
      Root: false
    },
    init: function()
    {
      var clockInComp = this
      
      
      //hook phonegap's geotracking to ractive.
      //Whenever the phone's location changes, it will be
      //pushed into thisComp.Location
      navigator.geolocation.watchPosition(
        function(position)
        {
          var location = 
          {
            Latitude: position.coords.latitude,
            Longitude: position.coords.longitude
          }
          clockInComp.set("Location", location)
        })
      this.on("RootClick", function()
      {
        navigator.geolocation.getCurrentPosition(
          function(position)
          {
            //get current location
            var location = 
            {
              Latitude: position.coords.latitude,
              Longitude: position.coords.longitude
            }
            
            clockInComp.set("root", location)
          },
          //if phonegap could not get the current position
          function(error)
          {
            clockInComp.set("Location", {Latitude: 44.56702151, Longitude: -123.27185869})
          })
      })
      
    }
  })
})
