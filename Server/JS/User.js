exports = module.exports = User;

//This class reperesents a user within the mysql database.
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
      Email: user.email,
      Name: user.name,
      Phone: user.phone,
      Admin: user.admin,
      Deliverer: user.deliverer,
      AcceptingOrders: user.acceptingOrders
    }
  }
  
  function CreateRememberMeToken()
  {
    return new promise(function(fulfill, reject)
    {
      //generate random token
      var token = _randomString(64)
      
      //ensure token does not already exist in database
      var sql = "SELECT * from RememberMeTokens where token = $token"
      var qry = db.prepare(sql)
      qry.all({$token: md5(token)}, function(err, rows)
      {
        //if this token is already registered
        if(rows.length > 0)
        {
          //recursively attempt to generate another token
          CreateRememberMeToken()
          .then(function(token)
          {
            fulfill(token)
          })
        }
        //if this token is not yet registered
        else
        {
          //register the token
          var sql = "INSERT into RememberMeTokens(token, userId) Values($token, $userId)"
          var qry = db.prepare(sql)
          qry.run({$token: md5(token), $userId: user.userId})
          
          //return the token
          fulfill(token)
        }
      })
    })
  }
  
  //Method used by users to change properties of User. Not meant to make any
  //changes to employment or administrative privileges
  //
  //Parameters:
  //  pkg: Json object containing key value pairs for database columns.
  //  callingUser: User who is making the function call. Necessary to ensure
  //    only admins can change administrative priviledges.
  function Update(pkg, callingUser)
  {
    //validate parameters
    if(!pkg)throw "Package not sent to user.Update";
    if(!callingUser) throw "CallingUser not sent to user.Update";
    
    //if the calling user does not have permission to make changes to this user
    if(!callingUser.admin && !callingUser.userId == user.userId)
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
      if(prop.toLowerCase() == "admin" && !callingUser.Admin)
        throw "Incorrect priviledges to change the administrative priviledges of a user!"
      if(prop.toLowerCase() == "employee" && !callingUser.Admin)
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
  
  //creates a random string of the given length
  function _randomString(length) 
  {
    var buf = []
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; ++i) 
      buf.push(chars[_randomInt(0, chars.length - 1)])

    return buf.join('')
  }

  function _randomInt(min, max) 
  {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  
  
  
  /* CONSTRUCTOR */
  
  var _ = require("underscore")
  //validate parameters
  if(!db)
    throw "Error: No sql database fed to new User"
  if(!user)
    throw "No user row sent to new User"
  
  //clone user data
  user = _.clone(user)
    
  var md5 = require("MD5")
  
  
  return{
    __proto__: user,
    Update: Update,
    CreateRememberMeToken: CreateRememberMeToken,
    ToJson: ToJson
  }
}