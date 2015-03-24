//Defines the functionality for 
define([],
function()
{
  function Order(orderRow, db)
  {
    //Turns the Order into a JSON object that
    //can be sent to clients
    this.toJson = function()
    {
      return{
        orderId: orderRow.orderId,
        timePickedUp: orderRow.timePickedUp,
        timeDelivered: orderRow.timeDelivered,
        canceled: orderRow.canceled
      }
    }
  }
  
  return Order
})