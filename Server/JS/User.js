define([],
function()
{
  //This class reperesents a user within the sqlite database.
  //
  //Requires:
  //  db: reference to the sqlite database object
  //  user: a row from the Users table
  function User(db, user)
  {  
    /* PUBLIC METHODS */
    
    //Converts this user into a JSON object
    //that will be sent to the user.
    function ToJson()
    {
      return{
        userId: user.userId,
        Email: user.email,
        Name: user.name,
        Phone: user.phone,
        Admin: user.admin,
        Deliverer: user.deliverer,
        AcceptingOrders: user.acceptingOrders,
        DeliveryRange: user.deliveryRange,
        Root: user.root.ToJson(),
      }
    }
    

    //Method used by users to change properties of User. Not meant to make any
    //changes to employment or administrative privileges
    //
    //Parameters:
    //  pkg: Json object containing key value pairs for database columns.
    //  callingUserIsAdmin: Bool
    function Update(pkg, callingUserIsAdmin)
    {
      //validate parameters
      if(!pkg)throw "Package not sent to user.Update";
      
      //if the calling user does not have permission to make changes to this user
      if(!callingUser.admin && callingUser.userId != user.userId)
        throw "User calling user.Update() does not have privilege to do so."
      
      //create sql query
      var sql = "update Users set "
      for(var prop in pkg)
      {
        //ensure user contains the property
        if(!user[prop])
          throw "Tried to change nonexisting property in user table: " + prop
          
        //ensure no priviledged properties are being changed
        if(prop.toLowerCase() == "userid")
          throw "Tried to change userId of a user. This should never change."
        if(prop.toLowerCase() == "admin" && !callingUserIsAdmin)
          throw "Incorrect priviledges to change the administrative priviledges of a user!"
        if(prop.toLowerCase() == "employee" && !callingUserIsAdmin)
          throw "Incorrect priviledges to change the employement of a user!"
          
        //md5 the password if necessary
        if(prop.toLowerCase() == "password")
          pkg[prop] = mdg5(pkg[prop])
          
        sql += prop + " = :"+prop + ","
      }
      //subtract last comma from loop above
      sql = sql.substring(0, sql.length() - 1)
      
      //complete sql query
      sql += " where userId = :userId"
      //perpare it, preventing sql injection
      var query = db.perpare(sql)
      query.bindValue(":userId", user.userId)
      
      for(var prop in pkg)
      {
        //set property values in prepared query
        query.bindValue(":"+prop, pkg[prop])
        //set property locally
        user[prop] = pkg[prop]
      }
        
      query.execute()
    }
    
    
    
    /* PRIVATE METHODS */
    
    /* CONSTRUCTOR */
    
    var _ = require("underscore")
    var md5 = require("MD5")
    
    //validate parameters
    if(!db)
      throw "Error: No sql database fed to new User"
    if(!user)
      throw "No user row sent to new User"
    
    return{
      __proto__: _.clone(user),
      Update: Update,
      ToJson: ToJson
    }
  }
  return User
})