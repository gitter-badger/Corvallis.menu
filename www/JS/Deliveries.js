//Deliveries page of the client
//define module for requirejs
define(["jquery", "Ajax"], 
function($, Ajax)
{
  Ractive.components.Deliveries = Ractive.extend({
    template: Templates["Deliveries.html"],
    data:
    { 
    },
    init: function()
    {
      ractive = this
      this.on("testButtonClick",
        function(event)
        {
          Ajax.Get("Test", null, function(response)
          {
            ractive.set("test", response)
          })
        })
    }
  })
})


