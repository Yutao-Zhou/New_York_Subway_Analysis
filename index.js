const date = ["03/25/2023", "03/26/2023", "03/27/2023", "03/28/2023", "03/29/2023", "03/30/2023", "03/31/2023"]
const time = ["00:00:00", "04:00:00", "08:00:00", "12:00:00", "16:00:00", "20:00:00"]
const stationmap = {};
const size = 10
// object used to store all circle object
let allCircle = {}

for ( let i = 0; i < 200; i++) {
  stationmap["dsfas"+i] = {
    "station": "77th St",
    "center": { lat: 40.78567199998607+(Math.random()-0.5)*0.1, lng: -73.9510700015425+(Math.random()-0.5)*0.1 },
    "enter": Math.random()*100,
    "exit": Math.random()*100,
    "date": "03/29/2023",
    "time": "00:00:00"
  }
};

async function initMap(date="03/25/2023", time="00:00:00") {
  console.log(date, time)
  //Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerView } = await google.maps.importLibrary("marker");
  // Create the map.
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: { lat: 40.75, lng: -73.95 },
    mapTypeId: "roadmap",
  });
  // add transitLayer
  const transitLayer = new google.maps.TransitLayer();
  transitLayer.setMap(map);
  // Construct the circle for each value in citymap.
  // Note: We scale the area of the circle based on the population.
  for (const stationID in stationmap) {
    // Add the circle for this station to the map.
    allCircle[stationID] = {'enter': new google.maps.Circle({
      strokeColor: "red",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "red",
      fillOpacity: 0.05,
      map,
      center: stationmap[stationID]["center"],
      radius: Math.sqrt(stationmap[stationID]["enter"]) * size
    })}
    allCircle[stationID]["exit"] = new google.maps.Circle({
      strokeColor: "blue",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "blue",
      fillOpacity: 0.05,
      map,
      center: stationmap[stationID]["center"],
      radius: Math.sqrt(stationmap[stationID]["exit"]) * size
    })
  }
};

initMap();

const streamButton = document.getElementById('streamButton');
const timeLineSlider = document.getElementById('timeLineSlider');
const timelineText = document.getElementById('timelineText');

const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

function updateCircle(date, time) {
  console.log(date, time)
  for (const stationID in stationmap) {
    allCircle[stationID]['enter'].setRadius(150+(Number(date.slice(3,5))+Number(time.slice(0,2)))*10);
    allCircle[stationID]['exit'].setRadius(100+(Number(date.slice(3,5))+Number(time.slice(0,2)))*10);
  };
}

streamButton.addEventListener('click', async function stream() {
  const initialText = 'Start Streaming';
  const stopText = "Stop Streaming";
  console.log(streamButton.textContent)
  if (streamButton.textContent === initialText) {
    streamButton.textContent = stopText;
    while (streamButton.textContent === stopText) {
      let dateSelected = date[Math.floor(timeLineSlider.value / 6)];
      let timeSelected = time[timeLineSlider.value % 6];
      updateCircle(dateSelected, timeSelected);
      if (dateSelected === "03/31/2023" && timeSelected === "20:00:00") {
        streamButton.textContent = initialText;
        break
      }
      await sleep(100);
      timeLineSlider.stepUp(1);
      timelineText.innerHTML = `Time: ${dateSelected} ${timeSelected}`;
    }
  } else {
    streamButton.textContent = initialText;
  }
});

timeLineSlider.addEventListener('input', function handleSlide() {
  let dateSelected = date[Math.floor(timeLineSlider.value / 6)];
  let timeSelected = time[timeLineSlider.value % 6];
  console.log(dateSelected, timeSelected)
  updateCircle(dateSelected, timeSelected);
  timelineText.innerHTML = `Time: ${dateSelected} ${timeSelected}`;
}, false);


// Pie chart
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawPieChart);

// Draw the chart and set the chart values
function drawPieChart() {
  var data = google.visualization.arrayToDataTable([
  ['Day of the Week', 'Throughput'],
  ['Mondy', 8],
  ['Tuesday', 2],
  ['Wednesday', 4],
  ['Thursday', 2],
  ['Friday', 8],
  ['Saturday', 8],
  ['Sunday', 8],
]);

  // Optional; add a title and set the width and height of the chart
  var options = {
    title:'Daily Throughput for Each Day of the Week',
    backgroundColor: { fill:'transparent' }
  };

  // Display the chart inside the <div> element with id="piechart"
  var chart = new google.visualization.PieChart(document.getElementById('piechart'));
  chart.draw(data, options);
}

// Bar chart
google.charts.load('current', {packages: ['corechart', 'bar']});
google.charts.setOnLoadCallback(drawStacked);

function drawStacked() {
      var data = google.visualization.arrayToDataTable([
        ['Year', 'Entry', 'Exit'],
        ['2019', 8175000, 8008000],
        ['2020', 3792000, 3694000],
        ['2021', 2695000, 2896000],
        ['2022', 2099000, 1953000],
        ['2023', 1526000, 1517000]
      ]);

      var options = {
        title: 'Throughput By Year',
      backgroundColor: { fill:'transparent' },
        chartArea: {width: '50%'},
        isStacked: true,
        hAxis: {
          title: 'Total Throughput',
          minValue: 0,
        },
        vAxis: {
          title: 'Year'
        }
      };
      var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
      chart.draw(data, options);
    }
// Curve line
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawLineChart);

function drawLineChart() {
  var data = google.visualization.arrayToDataTable([
    ['Hour', 'Entry', 'Exit', 'Total'],
    ['00',  1000,      400, 2000],
    ['04',  1170,      460, 2000],
    ['08',  660,       1120,  2000],
    ['12',  1030,      540, 2000],
    ['16',  1030,      540, 2000],
    ['20',  1030,      540, 2000]
  ]);

  var options = {
    title: 'Throughput at Different Times',
    curveType: 'function',
    legend: { position: 'bottom' },
    backgroundColor: { fill:'transparent' },
    hAxis: {
      title: 'Perioud Throughput',
    },
    vAxis: {
      title: 'Person-times'
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

  chart.draw(data, options);
}