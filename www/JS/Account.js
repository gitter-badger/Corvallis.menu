//Client side Cart page.
//Handles all of cart's calls to the server,
//and creation of the cart page

//define module for requirejs
define(["jquery", "Ajax"], 
function($, Ajax)
{
  var accountComp
  
  //Attempts to save the currently entered credentials
  function Save(event)
  {      
    //collect newly input user data
    var email = this.get("Credentials.Email")
    var name = this.get("Credentials.Name")
    var password = this.get("Credentials.Password")
    var phone = this.get("Credentials.Phone")
    
    //filter out null values
    var newValues = {email: email, name: name, password: password, phone: phone}
      .filter(function(variable){ return variable })
      
    //disable ajax updates until the next request completes.
    this.set("Processing", true)
    //Time for the ajax request.
    var posting = Ajax.Post("UpdateUser", newValues)
    posting.done(function(response)
    {
      accountComp.set("Processing", false)
      //if a response was given, parse it for its value
      if(response)
        response = JSON.parse(response.pkg)
      //if the parsed response has content
      accountComp.set("Err", response.err)

      //if the user was successfully created
      if(response.user)
      {
        //update user info
        accountComp.get("User")
        accountComp.set("User", response.user)
        //clear entered data
        accountComp.set("Credentials", {})
      }
    })
  }
  
  //bind page to container
  Ractive.components.Account = Ractive.extend({
    template: Templates["Account.html"],
    data:
    { 
      Credentials: {},
      Processing: false,
      Err: false
    },
    init: function()
    {
      accountComp = this
      this.on("SaveClick", Save)
    }
  })
})


