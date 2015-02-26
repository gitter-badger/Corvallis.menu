//Client side Cart page.

//define module for requirejs
define(["Shared/JS/VenderIsOpen", "Shared/JS/CalcOrderPrice", "underscore", "jquery", "Ajax"], 
  function(VenderIsOpen, CalcOrderPrice, _, $, Ajax)
  {
    //local variables
    var cartComp
    var chosenVender
    
    //Adds the given item to the cart
    function AddToCart(event, item, parentVender)
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
      cartComp.push("Items", item)
    }
    
    //Initiates the purchase of the current cart
    function Purchase(event)
    {
      //get items
      var items = cartComp.get("Items")
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
          var order = {Items: items, Vender: chosenVender, Token: token.id}
          var posting = Ajax.Post("SubmitOrder", order)
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
     
    //Define the component
    Ractive.components.Cart = Ractive.extend({
    template: Templates["Cart.html"],
    data:
    { 
      Items: []
    },
    init: function()
    {
      cartComp = this
      
      //attach functions
      this.on("Purchase", Purchase)
      this.on("AddToCart", AddToCart)
    }
  })
})


