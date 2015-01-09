//Calculates the price of an order given its list of items

//define module for requirejs
define(function()
{
  function _calcFirstXFree(addon)
  {
  }

  function _calcCheckboxes(addon)
  {
    var price = 0
    
    //get the price of each selected option
    addon.Options.forEach(function(option)
    {
      //if this option costs money and has been selected
      if(option.Selected && option.Price)
        price += option.Price
    })
    
    return price
  }

  //Core function that will be returned.
  //Accepts a list of Items, or an Order object,
  //and traverses all items and addons
  //to determine the total price
  function CalcOrderPrice(items)
  {      
    var price = 0
  
    //go through each item adding its cost to the total
    items.forEach(function(item)
    {
      //if this item has a base price
      if(item.Price)
        price += item.Price
       
      //loop through each addon and add its price to the total
      if(item.Addons)
      {      
        item.Addons.forEach(function(addon)
        {
          //make sure an InputType was given
          if(!addon.InputType) 
            return
            
          if(addon.InputType.toLowerCase() === "checkboxes")
            price += _calcCheckboxes(addon)
        })
      }
    })
    
    return price
  }
  
  return CalcOrderPrice
})