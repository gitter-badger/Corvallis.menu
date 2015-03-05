//client side deliver page

//define module for requirejs
define(["jquery", "Ajax"], 
function($, Ajax)
{
  Ractive.components.Deliver = Ractive.extend({
    template: Templates["Deliver.html"],
    data:
    { 
      Stage: 1
    },
    init: function()
    {
      var deliverComp = this
      this.on("RootClick", function()
      {
        navigator.geolocation.getCurrentPosition(
          function(position)
          {
            var location = 
            {
              Latitude: position.coords.latitude,
              Longitude: position.coords.longitude
            }
            deliverComp.set("Location", location)
          },
          function(error)
          {
            deliverComp.set("Location", {Latitude: -1, Longitude: -1})
          })
      })
      //window.open('https://connect.squareup.com/oauth2/authorize?client_id=y2y2pbZ7uU9clCF_uyHT5g&response_type=token', '_system')
    }
  })
})


