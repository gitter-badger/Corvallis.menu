exports = Cart;

//Client side of the Search page.
//Handles all of search's calls to the server,
//and creation of the Search page's <div>
function Cart()
{
  /* PUBLIC METHODS */
  
  //Adds the given item to the cart
  function AddToCart(item, parentVender)
  {
    //validate parameters
    if(!item || !parentVender)
      throw "Null parameter given to Cart.AddToCart"
      
    //copy items
    item = _.clone(item)
    parentVender = _.clone(parentVender)
    
      
    //trim unnecessary properties from vender
    delete parentVender.Items
    
    //if trying to add an item from a different restaurant
    if(chosenVender && !_.isEqual(chosenVender, parentVender))
    {
      alert("All items in an order must come from the same restaurant. Please clear your cart, or order from " + chosenVender.Name)
      return
    }
    
    chosenVender = parentVender;
    
    //add item to collection
    ractive.push("Items", item)
  }
  
  //Initiates the purchase of the current cart
  function Purchase()
  {
    //get items
    var items = ractive.get("Items")
    //ensure nonempty order
    if(items.length <= 0)
      return
      
    //calculate price of order
    var totalPrice = 100
    
    //create handler for payment
    var stripeHandler = StripeCheckout.configure(
    {
      key: 'pk_test_Wa5xdqFiCM9E6ZnUq0Vg0zSW',
      image: '/square-image.png',
      token: function(token) 
      {
        //This method is triggered when the user has paid.
        //send purchase to server
        //send ajax request to server
        $.get("SubmitOrder", { Order: JSON.stringify({Items: items, Vender: chosenVender, Token: token.id}) }, function(response)
        {
          //if a response was given, parse it for its value
          if(response)
            response = JSON.parse(response)
          //if the parsed response has content
          if(response)
          {
            //HANDLE SUCCESSFUL ORDER HERE
          }
        });
      }
    })
    
    //prompt user to pay
    stripeHandler.open(
    {
      name: "Corvallis Menu",
      description: "Food Delivery",
      amount: totalPrice
    })
  }
   
  /* PRIVATE METHODS */
  
  //Required to inherit from class Page
  //This method initiates ractive
  //binding data and logic to the front end HTML
  function _attachRactive(template)
  {      
    //bind page to container
    ractive = new Ractive({
      el: "#cartPage",
      template: template,
      data:
      { 
        Items: [],
        Purchase: Purchase
      }
    })
    
    //bind button clicks
    ractive.on("Purchase", function(event)
    {
      Purchase()
    })
  }
  
  //Required to inherit from class Page 
  //This method defines a single pulse of the heartbeat.
  //Tells the server the client's version, and the server
  //responds with the updated database if desynced
  function _heartbeat()
  {
    //TODO: Make a heartbeat that keeps the cart current. If an account is logged in
    //in multiple locations, the carts should be syncd.
  }
  
  
  
  
  
  /* CONSTRUCTOR */ 
 
  
  //local variables
  var ractive
  var chosenVender
  
  return{
    __proto__: Page("Client/HTML/Cart.html", _attachRactive, _heartbeat),
    AddToCart: AddToCart,
    Purchase: Purchase
  }
}


