//Defines the functionality for 
define([],
function()
{
  function Order(orderRow, db)
  {
    //
    this.toJson = function()
    {
      return{
        orderId: orderRow.orderId
        
      }
    }
  }
  
  return Order
})