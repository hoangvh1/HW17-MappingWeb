
var queryUrl = "http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {createFeatures(data.features);});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {

    onEachFeature: onEachFeature,

    pointToLayer: function (feature, latlng) {      
      var color;
      var r = 255;
      var g = Math.floor(255-80*feature.properties.mag);
      var b = Math.floor(255-200*feature.properties.mag);
      color= "rgb("+r+" ,"+g+","+ b+")"

      var geojsonMarkerOptions = {
        radius: 4*feature.properties.mag,
        fillColor: color,
        color: "gold",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };

      return L.circleMarker(latlng, geojsonMarkerOptions);}});

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function choosecolor(magnitude){
  switch(true){
    case magnitude >7: return '#ff0000'
    case magnitude >6: return '#ff4000'
    case magnitude >5: return '#ff8000'
    case magnitude >4: return '#ffbf00'
    case magnitude >3: return '#ffff00'
    case magnitude >2: return '#bfff00'
    case magnitude >1: return '#80ff00';}}

  function getRadius(magnitude){return magnitude*4;}

  function style(feature){return{
    fillcolor: choosecolor(feature.properties.mag),
    weight:1,
    opacity:1,
    fillOpacity: 0.7,
    radius: getRadius(feature.properties.mag)}}
 
//Add another set of data "Tectonic Plates"
var tectonic = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

var tectonicplates = new L.layerGroup();
d3.json(tectonic, function(response){
  function styles(feature){
    return {fillcolor:'#ff00ff',weight:2.5, opacity:.5, color: "#ff00ff", fillOpacity:.4};
  }
L.geoJSON(response,{style:styles}).addTo(tectonicplates);
tectonicplates.addTo(myMap)})

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoidmFuaG9hbmcxIiwiYSI6ImNqZWJrOWxzNDBmaWkyeG1rejhxaHBkdGkifQ." +
  "I7N-n1Lc-9ZorC6pl4tA6g");

  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoidmFuaG9hbmcxIiwiYSI6ImNqZWJrOWxzNDBmaWkyeG1rejhxaHBkdGkifQ." +
  "I7N-n1Lc-9ZorC6pl4tA6g");

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Satellite Map": satellite};

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": tectonicplates};

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {center: [37.09, -95.71],zoom: 3,
    layers: [streetmap, earthquakes]});

    // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
//Create legend

// Create a legend to display information about our map
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend'),
  grades = [1, 2, 3, 4, 5, 6, 7],
  labels = [];

  div.innerHTML+='Magnitude<br><hr>'

// loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
    ' <i style="background:' + choosecolor(grades[i] + 1) + '"></i> ' +
    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }

  return div;
};

legend.addTo(myMap);



