exports = module.exports = Search;

//Server side of the Seach page.
//Handles interaction between the client and the sql database.
function Search(database)
{
  
	/* PUBLIC METHODS */
  
	//Provides the heartbeat for the searchpage,
	//providing the client with current database information
	//if the client is out of sync with the database.
	//
	//Expects the unprocessed request recieved by the server.
	//
	//Returns all tables required for search to function on the client
	//or--if client is current--nothing
	function Heartbeat(request, callback)
	{
    //get client's version
    var clientVersion = request.query.clientVersion
    
    //if information is current, send a null response
    if(clientVersion == database.GetVersion())
    {
      if(callback)
        callback(false)
    }
    //if information is not current, send current database information
    else
    {
      if(callback)
      {
        callback({ Version: database.GetVersion(), VenderData: database.GetVenderData() })
      }
    }
	}
  
	return{
		Heartbeat: Heartbeat
	}
}