//Client side Cart page.
//Handles all of cart's calls to the server,
//and creation of the cart page

//define module for requirejs
define(["JS/Page", "Shared/JS/VenderIsOpen", "Shared/JS/CalcOrderPrice", "underscore", "jquery", "Ajax"], 
function(Page, VenderIsOpen, CalcOrderPrice, _, $, Ajax)
{
  
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
      
      //mark item as selected
      item.Selected = true
        
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
      var totalPrice = 100*CalcOrderPrice(items)
      
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
          var posting = Ajax.Post("SubmitOrder", {Order: JSON.stringify({Items: items, Vender: chosenVender, Token: token.id})})
          posting.done(function(response)
          {
            //if a response was given, parse it for its value
            if(response)
              response = JSON.parse(response)
            //if the parsed response has content
            if(response)
            {
              //HANDLE SUCCESSFUL ORDER HERE
            }
          })
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
    function _attachRactive()
    {      
        //bind page to container
        var component = Ractive.extend({
        template: Templates["Cart.html"],
        data:
        { 
          Items: [],
          Purchase: Purchase
        },
        init: function()
        {
          ractive = this
          
          //bind button clicks
          this.on("Purchase", function(event)
          {
            Purchase()
          })
        }
      })
      
      
      Ractive.components.Cart = component
    }
    
    
    
    
    
    /* CONSTRUCTOR */ 
   
    
    //local variables
    var ractive
    var chosenVender
    _attachRactive()
    
    return{
      __proto__: Page(),
      AddToCart: AddToCart,
      Purchase: Purchase
    }
  }
  
  return Cart
})


