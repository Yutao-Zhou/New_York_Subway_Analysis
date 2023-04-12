const date = ["03-25-2023", "03-26-2023", "03-27-2023", "03-28-2023", "03-29-2023", "03-30-2023", "03-31-2023"]
const time = ["00:00:00", "04:00:00", "08:00:00", "12:00:00", "16:00:00", "20:00:00"]
const stataionData = {};
const size = 10;
// object used to store all circle object
let allCircle = {};

for ( let i = 0; i < 200; i++) {
  stataionData["dsfas"+i] = {
    "station": `${i}th St`,
    "center": { lat: 40.78567199998607+(Math.random()-0.5)*0.1, lng: -73.9510700015425+(Math.random()-0.5)*0.1 },
    "enter": Math.round(Math.random()*100),
    "exit": Math.round(Math.random()*100),
    "date": "03-29-2023",
    "time": "00:00:00"
  }
};

async function initMap(date="03-25-2023", time="04:00:00") {
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
  for (const stationID in stataionData) {
    // Add the circle for this station to the map.
    allCircle[stationID] = {
      'enter': new google.maps.Circle({
        strokeColor: "red",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "red",
        fillOpacity: 0.05,
        map,
        center: stataionData[stationID]["center"],
        radius: Math.sqrt(stataionData[stationID]["enter"]) * size
        }), 
      "exit" : new google.maps.Circle({
        strokeColor: "blue",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "blue",
        fillOpacity: 0.05,
        map,
        center: stataionData[stationID]["center"],
        radius: Math.sqrt(stataionData[stationID]["exit"]) * size
        })
    };
  }
};

initMap();
createTable(stataionData);
console.log(allCircle)



const streamButton = document.getElementById('streamButton');
const timeLineSlider = document.getElementById('timeLineSlider');
const timelineText = document.getElementById('timelineText');

const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

function get_throughput(date, time) {
  const url = `/data/${date}/${time}`;
  fetch(url)
      .then(response => response.json())
      .then(data => {
          console.log(data);
          jsonBox.textContent = JSON.stringify(data, null, 2);
          })
      .catch(error => console.error(error));
}

function updateCircle(stataionData) {
  for (let stationID in stataionData) {
    allCircle[stationID]['enter'].setRadius(150+Math.random()*10);
    allCircle[stationID]['exit'].setRadius(100+(Math.random()*10));
  };
}

function appendRow(table, rank, stationName, enter, exit) {
  let row = table.insertRow(-1);
  let rnk = row.insertCell(0);
  let station = row.insertCell(1);
  let throughput = row.insertCell(2);
  let enterNum = row.insertCell(3);
  let exitNum = row.insertCell(4);
  rnk.innerHTML = `${rank}`;
  station.innerHTML = `${stationName}`;
  throughput.innerHTML = `${enter + exit}`;
  enterNum.innerHTML = `${enter}`;
  exitNum.innerHTML = `${exit}`;
}

function createTable(stataionData) {
  const table = document.getElementById('ranking_table');
  for (let i = 1; i < 11; i++) {
    let currentStation = Object.values(stataionData)[i - 1];
    appendRow(table, i, currentStation["station"], currentStation["enter"], currentStation["exit"]);
  }
}

function updateTable(stataionData) {
  const table = document.getElementById('ranking_table');
  for (let i = 1; i < 11; i++) {
    let currentStation = Object.values(stataionData)[i - 1];
    appendRow(table, i, `updated${currentStation["station"]}`, currentStation["enter"], currentStation["exit"]);
    table.deleteRow(1);
  }
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
      // stataionData = get_throughput(dateSelected, timeSelected);
      updateCircle(stataionData);
      updateTable(stataionData);
      if (dateSelected === "03-31-2023" && timeSelected === "20:00:00") {
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
  // stataionData = get_throughput(dateSelected, timeSelected);
  updateCircle(stataionData);
  updateTable(stataionData);
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