var worldWidth = 15360;
var worldHeight = 15360;

var mapCutOffY = 1400; /* Where the image of the map cuts off */

function mapLoad()
{
	// Hook window resizing
	window.onresize = markersAlign;

	// Get players and vehicles
	getPlayers();
	getVehicles();

	// Start timer for ajax requests
	setInterval(getPlayers, 2000);
	setInterval(getVehicles, 4000);
}
function getPlayers()
{
    Ajax(getBaseURL() + "/GetPlayers.aspx", "GET",
		function (a)
		{
		    // Clear pre-existing players
		    markersRemove(false);
		    // Add each player
		    var data = a.responseXML.getElementsByTagName("d")[0];
		    var node;
		    for (var i = 0; i < data.getElementsByTagName("p").length; i++)
		    {
		        node = data.getElementsByTagName("p")[i];
		        markerAdd(
					node.getElementsByTagName("uid")[0].childNodes[0].nodeValue,
					node.getElementsByTagName("username")[0].childNodes[0].nodeValue,
					node.getElementsByTagName("x")[0].childNodes[0].nodeValue,
					node.getElementsByTagName("y")[0].childNodes[0].nodeValue,
                    false
				);
		    }
		    // Realign markers
		    markersAlign();
		},
		function ()
		{
		    document.getElementById("CORDS").innerHTML = "Failed to update players!";
		}
	);
}
function getVehicles()
{
    Ajax(getBaseURL() + "/GetVehicles.aspx", "GET",
		function (a)
		{
		    // Clear pre-existing players
		    markersRemove(true);
		    // Add each vehicle
		    var data = a.responseXML.getElementsByTagName("d")[0];
		    var node;
		    for (var i = 0; i < data.getElementsByTagName("v").length; i++)
		    {
		        node = data.getElementsByTagName("v")[i];
		        markerAdd(
					node.getElementsByTagName("title")[0].childNodes[0].nodeValue,
                    node.getElementsByTagName("title")[0].childNodes[0].nodeValue,
					node.getElementsByTagName("x")[0].childNodes[0].nodeValue,
					node.getElementsByTagName("y")[0].childNodes[0].nodeValue,
                    true
				);
		    }
		    // Realign markers
		    markersAlign();
		},
		function ()
		{
		    document.getElementById("CORDS").innerHTML = "Failed to update vehicles!";
		}
	);
}
function markerAdd(uid, username, worldX, worldY, vehicle)
{
	var markers = document.getElementById("MARKERS");
	// Create the marker
	var marker = document.createElement("div");
	marker.id = "MARKER_" + uid;
	marker.className = vehicle ? "MARKER VEHICLE" : "MARKER";
	marker.innerHTML = "<div class=\"B\">&nbsp;</div><div class=\"U\">" + username + "</div>";
	marker.onmousemove = mapMove;
	// Set position attribs
	marker.setAttribute("pos_x", worldX);
	marker.setAttribute("pos_y", worldY);
	if(vehicle) marker.setAttribute("vehicle", "1");
	// Add the marker to the markers markup array
	markers.appendChild(marker);
}
function markersRemove(vehicles)
{
    var markers = document.getElementById("MARKERS");
    var isVehicle;
    var node;
    for (var i = 0; i < markers.childNodes.length; i++)
    {
        node = markers.childNodes[i];
        if (node.getAttribute)
        {
            isVehicle = node.getAttribute("vehicle") != null;
            if ((vehicles && isVehicle) || (!vehicles && !isVehicle))
                markers.removeChild(node);
        }
    }
}
function markersAlign()
{
	var markers = document.getElementById("MARKERS");
	var map = document.getElementById("MAP");
	var mapWidth = map.width;
	var mapHeight = map.height;
	var marker, topX, topY;
	for(var i = 0; i < markers.childNodes.length; i++)
	{
		marker = markers.childNodes[i];
		if(marker != null && marker.getAttribute != null && marker.getAttribute("pos_x") != null && marker.getAttribute("pos_y") != null)
		{
			topX = map.offsetLeft + ((marker.getAttribute("pos_x") / worldWidth) * mapWidth);
			topY = map.offsetTop + (( (worldHeight - marker.getAttribute("pos_y")) / (worldHeight - mapCutOffY)) * mapHeight);
			marker.style.left = (topX -(marker.childNodes[1].offsetWidth / 2) ) + "px";
			marker.style.top = (topY -(marker.childNodes[1].offsetHeight / 2) ) + "px";
		}
	}
}
function mapMove()
{
	var map = document.getElementById("MAP");
	var x = window.event.clientX;
	var y = window.event.clientY;
	var worldX = ((x - map.offsetLeft) / map.width) * worldWidth;
	var worldY = worldHeight - (((y - map.offsetTop) / map.height) * (worldHeight - mapCutOffY));
	document.getElementById("CORDS").innerHTML = "X: " + Math.round(worldX) + ", Y: " + Math.round(worldY);
}
function Ajax(url, method, success, failure)
{
    var a;
    if (window.XMLHttpRequest) a = new XMLHttpRequest();
    else a = new ActiveXObject("Microsoft.XMLHTTP");
    a.onreadystatechange = function () {
        if (a.readyState == 4)
            if(a.status == 200) success(a);
            else failure(a);
    }
    a.open(method, url, true);
    a.send();
}
// Credit: http://www.gotknowhow.com/articles/how-to-get-the-base-url-with-javascript
function getBaseURL()
{
    var url = location.href;
    return url.substring(0, url.indexOf('/', 14));
}