//client side deliveries page

//define module for requirejs
define(["jquery", "Ajax"], 
function($, Ajax)
{
  Ractive.components.Deliveries = Ractive.extend({
    template: Templates["Deliveries.html"],
    data:
    { 
	Stage: 0
    },
    init: function()
    {
      var deliveriesComp = this
      //window.open('https://connect.squareup.com/oauth2/authorize?client_id=y2y2pbZ7uU9clCF_uyHT5g&response_type=token', '_system')
    }
  })
})


