//Client side Account page.

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
    
    //gather modified values
    var newValues = {}
    if(email) newValues.email = email
    if(name) newValues.name = name
    if(password) newValues.password = password
    if(phone) newValues.phone = phone
      
    //disable ajax updates until the next request completes.
    this.set("Processing", true)
    //Time for the ajax request.
    var posting = Ajax.Post("UpdateUser", JSON.stringify(newValues))
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
        
        $.body.append("<a>LinkValueHere!</a href='URL here!'>")
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


