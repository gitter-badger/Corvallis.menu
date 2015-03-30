//Calculates the distance between two points
define(function()
{
  function CalcDistance(pos1, pos2)
  {
    var radlat1 = Math.PI * pos1.Latitude/180
    var radlat2 = Math.PI * pos2.Latitude/180
    var radlon1 = Math.PI * pos1.Longitude/180
    var radlon2 = Math.PI * pos2.Longitude/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    return dist
  }
  
  return CalcDistance
})