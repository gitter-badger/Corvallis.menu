//client side deliver page

//define module for requirejs
define(["jquery", "Ajax", "JS/Deliver/ClockIn"], 
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
    else if(this.get("AssignedOrder").timeDelivered)
      this.set("Stage", "PostDelivery")
    //if the stage of the order could not be determined
    else
      this.set("Stage", "Error")
      
  }
  
  Ractive.components.Deliver = Ractive.extend({
    template: Templates["Deliver/Deliver.html"],
    data: 
    {
      Stage: "ClockIn",
      AssignedOrder: false,
      ProposedOrder: false
    },
    init: function()
    {
      var deliverComp = this
      
      //watch variables that determine which stage of the delivery we are in
      ractive.observe("AssignedOrder", setStage)
      ractive.observe("ProposedOrder", setStage)
      ractive.observe("User.acceptingOrders", setStage)
    }
  })
})


