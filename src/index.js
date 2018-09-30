////////////////////
// Alok Pepakayala
///////////////////
import React from 'react';
import ReactDOM from 'react-dom';
const THREE = require("threebox-src/three64.js"); 
const Threebox = require("threebox-src/Threebox.js");
import ButtonInterface from 'components/ButtonInterface.jsx';
import BarChart from 'components/BarChart.jsx';

var map, symbols, threebox;
mapboxgl.accessToken = 'pk.eyJ1IjoiYTEwayIsImEiOiJjaWdyMmVrazcwMXpsdTZtMThscWtiOTJtIn0.-A76dzJ0vsKULJdDxGvVXg'; //Mapbox access token
var source = {type: "FeatureCollection", features: []}; //New geojson sources to store the locations of cars
var colors = ['red', 'blue', 'green','yellow']; //all available colors..
var totals = { red:0, blue:0, green:0, yellow:0 } //cars actually added to street is counted here for charts..
var road = {}; //cars moving on the map..


class App extends React.Component {
  constructor(props,context) {
    super(props,context);
  }

  componentDidMount(){
    //Initiate the map
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/a10k/cjmjo6t9yowsi2rnidt44d8jg',
        center: [23.297484, 42.700484],
        zoom: 18,
        pitch:53,
        bearing:-21
    });
    map.on("load", mapLoadeventHandler);

    // Initialize threebox
    threebox = new Threebox(map);
    threebox.setupDefaultLights();
    symbols = threebox.addSymbolLayer({
        id:             "cars",
        source:         source,
        modelName:      { property: 'model'},    //.obj and .mtl file
        modelDirectory: "models/",
        rotation:       { generator: feature => (new THREE.Euler(Math.PI / 2, -feature.properties['headingChange'] * 10  * Math.PI / 180, -feature.properties['heading'] * Math.PI / 180, "ZYX")) },
        scale:          { property: 'size' },
        scaleWithMapProjection: true,
        key:            { property: "id" }
    });

    //for preloading textures..
    symbols.models = {
        'models/blue_car': {directory: "models/", name: "blue_car", loaded: false},
        'models/green_car': {directory: "models/", name: "green_car", loaded: false},
        'models/red_car': {directory: "models/", name: "red_car", loaded: false},
        'models/yellow_car': {directory: "models/", name: "yellow_car", loaded: false}
    }
    symbols._initialize();
  }

  render() {
    return (
      <div>
        <div id="map"></div>
      </div>
    )
  }
}

function spawnAndHighlight(c) {
  map.setFilter('car-circles', ['==', 'color', c]);
  buildNewCar(c, performance.now())
}

function buildNewCar(color,id){
    totals[color] += 1;
    updateChart();
    var coords = { 
        x: randomRange(23.30019814634662, 23.30022418769576), 
        y: randomRange(42.699956092012926 , 42.70004650267123) 
    };
    road[id] = {
        type: "Feature",
        properties: {
            heading: 282,
            headingChange: 0,
            size: 3 *0.05,
            id: id,
            model:color+'_car',
            color:color
        },
        geometry: {
            type: "Point",
            coordinates: [coords.x, coords.y, 0]
        }
    };
    var tween = new TWEEN.Tween(coords)
        .to({ 
            x: randomRange( 23.28805692495783, 23.28807107182439), 
            y: randomRange( 42.70186728263269, 42.70191959669157) 
        }, randomRange(20000,50000))
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(function() {
            road[id].geometry.coordinates = [coords.x, coords.y, 0];
        })
        .onComplete(function() {
            delete road[id];
            symbols.removeFeature(id)
        })
        .start();
}

function refreshSourceLayer(){
    source.features = [];
    Object.keys(road).forEach(function(d){
        source.features.push(road[d]);
    })
    map.getSource('circleSource').setData(source);
    symbols.updateSourceData(source)
    /*
    //resolved by fixing a bug in threebox addAtCoordinate function..
    if(Object.keys(symbols.models) && Object.keys(symbols.models).length < 4){
        symbols._initialize(); //this is only required because of the unimplemented parts of the threebox library..
    }
    */
}

function mapLoadeventHandler() {
    map.addSource('circleSource',{
        type:'geojson',
        data:source
    })

    map.addLayer({
        id: 'car-circles',
        type: 'circle',
        source: 'circleSource',
        paint: {
            'circle-radius': {
                stops: [[18,70]]
            },
            'circle-color': "#ffffff",
            'circle-opacity': 0.35
        },
        "filter": ["==", "color", "none"]
    });

    // Setup the animation loop.
    function animate(time) {
        TWEEN.update(time);
        requestAnimationFrame(animate);
        if(symbols.loaded && source) {
            refreshSourceLayer();
        }
    }

    //init.. also randomly add some cars to have some data without any explicit action by user..
    animate();
    randomlyAddCars();
    setupChart()
}

function randomlyAddCars(){
    buildNewCar(colors[Math.floor(randomRange(0,3.9))], performance.now())
    setTimeout(randomlyAddCars, randomRange(500,3000))
}

function randomRange(low, high) {
  //random number within range.. Note: this is a float, for ints use with math.floor
  return Math.random() * (high - low) + low;
}

function setupChart() {
  //chart js bar chart configuration
  var config = {
      type: 'bar',
      data: {
          datasets: [{
              data: [ 0, 0, 0, 0],
              backgroundColor: [
                  'rgba(255,51,102,1)',
                  'rgba(40,169,153,1)',
                  'rgba(29,172,214,1)',
                  'rgba(252,215,0,1)',
              ]
          }],
          labels: ['Red', 'Green', 'Blue', 'Yellow']
      },
      options: {
          responsive: false,
          legend: { display: false},
          scales: {
              xAxes: [{
                  gridLines: {
                      offsetGridLines: true
                  },
                  ticks:{
                      fontColor:'#fff'
                  }
              }],
              yAxes:[{
                  ticks:{
                      beginAtZero:true,
                      fontColor:'#fff'
                  }
              }]
          }
      }
  };
  //create the chart and have a function to update data..
  var ctx = document.getElementById('chart-area');
  window.histogram = new Chart(ctx, config);
  setupMarkers();
}

function updateChart() {
    if(window.histogram){
        histogram.data.datasets[0].data = [
            totals.red,
            totals.green,
            totals.blue,
            totals.yellow
        ]
        window.histogram.update();
    }
}

function setupMarkers() {
  // create draggable marker and add chart container to it..
  var marker = new mapboxgl.Marker({
          draggable: true,
          element:document.getElementById('bar')
      })
      .setLngLat([23.295933940866206, 42.70153312604933])
      .addTo(map);

  var buttomsMarker = new mapboxgl.Marker({
          draggable: true,
          element:document.getElementById('buttons')
      })
      .setLngLat([23.297752681396503, 42.699812321730406])
      .addTo(map);
  ReactDOM.render(<ButtonInterface spawnAndHighlight={spawnAndHighlight}/>, document.getElementById('buttons'));
  
  /*
  function onDragEnd() {
      var lngLat = buttomsMarker.getLngLat();
      console.log('Moving marker to:', lngLat)
  }
  buttomsMarker.on('dragend', onDragEnd);
  */
}

//Add the react component to DOM
ReactDOM.render(<BarChart />, document.getElementById('bar'));
ReactDOM.render(<App/>, document.getElementById('App'));
      
      