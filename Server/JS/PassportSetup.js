exports = module.exports = PassportSetup

function PassportSetup(database, app, passport)
{
  //gather required variables
  var LocalStrategy = require("passport-local").Strategy
  var RememberMeStrategy = require("passport-remember-me").Strategy
  
  
  //teach passport to serialize users
  passport.serializeUser(function(user, done)
  {
      //stored/retrieved by id
      done(null, user.userId);
  })

  //teach passport to deserialize users
  passport.deserializeUser(function(id, done)
  {
    var user = database.GetUserById(id)
    if(user)
      done(null, user)
    else  
      done("User could not be found.", null)
  })

  //Setup remember me strategy for exchanging tokens and users
  passport.use(new RememberMeStrategy(
    //define method for processing tokens and returning users
    function(token, done)
    {
      //attempt to consume the token
      database.ConsumeRememberMeToken(token)
      //if token consumed successfully
      .then(function(user)
      {
        done(false, user)
      },
      //if the token could not be consumed
      function(err)
      {
        done(err, false)
      })
    },
    //define method for creating a token for a user
    function(user, done)
    {
      database.CreateRememberMeToken(user)
      .then(function(token)
      {
        done(false, token)
      },
      function(err)
      {
        done(err, false)
      })
    }
  ))

  //Setup registration strategy
  passport.use("local-register", new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
  },
  function(req, email, password, done)
  {
    database.CreateUser(req.body.email, req.body.password, req.body.name, req.body.phone)
      .then(
      //User created successfully.
      function(user)
      { 
        console.log("New user registered:" + user.email)
        done(null, user)
      },
      //user creation failed
      function(err)
      {
        console.log("User registration failed: " + err)
        done(err, false)
      }
    )
  }))

  //Setup login strategy
  passport.use("local-login", new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
  },
  function(req, email, password, done)
  {
    database.LoginUser(email, password)
    .then(
      //if login successful
      function(user)
      {
        done(false, user)
      },
      //if login unsuccessful
      function(err)
      {
        done(err, false)
      }
    )  
  }))
}