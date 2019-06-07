function createMap(earthquakes) {
// Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap
  };

  // Create an overlayMaps object to hold the earthquakes layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  document.getElementById('map-id').innerHTML = "<div id='map' style='width: 100%; height: 100%;'></div>";

  var map = L.map("map", {
    center: [34.0522,-118.2437],
    zoom: 4,
    layers: 
      [lightmap, earthquakes]
    
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

  // Create a legend to display information about our map
  var legend = L.control({
    position: "bottomright"
  });

  // When the layer control is added, insert a div with the class of "legend"
  legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend'),
      magnitudes = [0, 1, 2, 3, 4, 5];
      labels = []
      
      for (var i = 0; i < magnitudes.length; i++) {
        div.innerHTML +=
        
            '<i style="background:' + markerColor(magnitudes[i] + 1) + '"></i> ' +
            magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
    }
      
    return div;
  };
  // Add the legend to the map
  legend.addTo(map);

}

function markerSize(mag) {
  return mag * 30000;
}

function markerColor(mag) {
  var cols=["#c1ebb5", "#bfc176","#c29348","#c05f37","#b11f3f", "#E6E67F"];

  if (mag <= 1) {
      return cols[0];
  } else if (mag <= 2) {
      return cols[1];
  } else if (mag <= 3) {
      return cols[2];
  } else if (mag <= 4) {
      return cols[3];
  } else if (mag <= 5) {
      return cols[4];
  } else {
      return cols[5]
  };
}

function createMarkers(response) {

  // Pull the quake features off of response
  var result = response.features;
  console.log("this is results" ,result)
  // Initialize an array to hold quake markers
  var quakeMarkers = [];

  // Loop through the stations array
  quakeRes=result.length
  
  for (var index = 0; index < quakeRes; index++) {
    var data = result[index].properties;

    coords=result[index].geometry.coordinates
    //console.log("lat",coords[0])
    //console.log("lng",coords[1])

    // For each quake, create a circle marker and bind a popup with the location name + magnitude

    var circleMarker=   L.circle([coords[1], coords[0]],
      {radius: markerSize(data.mag),
      fillColor: markerColor(data.mag),
      fillOpacity: 1,
      stroke: false,
     }).bindPopup("<h3><h3>Reported Earthquake " + "<h3><h3>Magnitude: " + data.mag + "<h3><h3>Location: "+ data.place+"<h3>");

    // Add the marker to quakeMarkers array
     quakeMarkers.push(circleMarker);

  }

  // Create a layer group made from the quakeMarkers array, pass it into the createMap function
  createMap(L.layerGroup(quakeMarkers));


}

// map function for reported hourly/ weekly/ monthly earthquakes
function runMap(){
  //set default json source URL
  var source="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
  //get the dropdown value
  var e = document.getElementById("period");
  var period = e.options[e.selectedIndex].value;

  //change json response based on dropdown value
  if (period=="monthly"){   
    source="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

  }else if (period=="weekly") {
    source="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

  }else if (period="hourly") {
  source="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";
  }


  // Perform an API call to the USGS information endpoint
  d3.json(source, createMarkers);
}

//iNitialize the runmap
runMap()