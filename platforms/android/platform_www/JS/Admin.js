//Client side Admin page

//define module for requirejs
define(["jquery", "Ajax"], 
function($, Ajax)
{ 
  //bind page to container
  Ractive.components.Admin = Ractive.extend({
    template: Templates["Admin.html"],
    data:
    { 
    },
    init: function()
    {
      ractive = this
    }
  })
})


