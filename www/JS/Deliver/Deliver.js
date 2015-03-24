//client side deliver page

//define module for requirejs
define(["jquery", "Ajax"], 
function($, Ajax)
{
  function setStage()
  {
    //if the user is not accepting orders
    if(!this.get("User").AcceptingOrders)
      this.set("Stage", "ClockIn")
    //else if no order has been assigned yet
    else if(!this.get("AssignedOrder"))
      this.set("Stage", "AwaitingOrder")
    //if an order has been proposed
    else if(this.get("ProposedOrder"))
      this.set("Stage", "ProposeOrder")
    //if the order has not been picked up yet
    else if(!this.get("AssignedOrder").timePickedUp)
      this.set("Stage", "RetrievingOrder")
    //if the order has been picked up but not delivered
    else if(!this.get("AssignedOrder").timeDelivered)
      this.set("Stage", "DeliveringOrder")
    //if the order has been picked up and delivered
    else
      this.set("Stage", "PostDelivery")
  }
  
  Ractive.components.Deliver = Ractive.extend({
    template: Templates["Deliver/Deliver.html"],
    data: {Stage: "ClockIn"},
    init: function()
    {
      var deliverComp = this
      
      //watch variables that determine which stage of the delivery we are in
      ractive.observe("AssignedOrder", setStage)
      ractive.observe("ProposedOrder", setStage)
      ractive.observe("User.acceptingOrders", setStage)
      
      
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
          deliverComp.set("Location", location)
        })
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
          //if phonegap could not get the current position
          function(error)
          {
            deliverComp.set("Location", {Latitude: 44.56702151, Longitude: -123.27185869})
          })
      })
      //window.open('https://connect.squareup.com/oauth2/authorize?client_id=y2y2pbZ7uU9clCF_uyHT5g&response_type=token', '_system')
    }
  })
})


