$(document).ready(function() {
  let temperatureData = [];
  let humidityData = [];
  let weatherMockData = [];
  let pollutantData = {
    PM25: [],
    PM10: [],
    NOx: [],
    NH3: [],
    CO2: [],
    SO2: [],
    VOC: []
  };

  function fetchLatLonByCity(cityName) {
    const geocodeUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    $.ajax({
      url: geocodeUrl,
      method: 'GET',
      success: function(data) {
        if (data.length > 0) {
          const city = { lat: data[0].lat, lon: data[0].lon };
          $('#vis-current-city').text(`Current city: ${cityName}`);
          fetchWeatherForecast(city);
        } else {
          console.error('City not found');
          $('#current-city').text('City not found');
        }
      },
      error: function(error) {
        console.error('Error fetching geocode data:', error);
        $('#current-city').text('Error fetching geocode data');
      }
    });
  }

  function fetchWeatherForecast(city) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`;
    $.ajax({
      url: forecastUrl,
      method: 'GET',
      success: function(data) {
        temperatureData = data.list.slice(0, 30).map(entry => entry.main.temp);
        humidityData = data.list.slice(0, 30).map(entry => entry.main.humidity);
        weatherMockData = data.list.map(entry => {
          const main = entry.weather[0].main;
          return main === 'Clear' ? 'Sunny' : main;
        });
        // For simplicity, simulate pollutant levels
        pollutantData.PM25 = Array.from({ length: 5 }, (_, _i) => Math.floor(Math.random() * 100));
        pollutantData.PM10 = Array.from({ length: 5 }, (_, _i) => Math.floor(Math.random() * 100));
        pollutantData.NOx = Array.from({ length: 5 }, (_, _i) => Math.floor(Math.random() * 100));
        pollutantData.NH3 = Array.from({ length: 5 }, (_, _i) => Math.floor(Math.random() * 100));
        pollutantData.CO2 = Array.from({ length: 5 }, (_, _i) => Math.floor(Math.random() * 100));
        pollutantData.SO2 = Array.from({ length: 5 }, (_, _i) => Math.floor(Math.random() * 100));
        pollutantData.VOC = Array.from({ length: 5 }, (_, _i) => Math.floor(Math.random() * 100));
        renderCharts();
      },
      error: function(error) {
        console.error('Error fetching forecast data:', error);
      }
    });
  }

  // Render charts function
  function renderCharts() {
    // Destroy existing charts to prevent the "Canvas is already in use" error
    if (window.temperatureChart) {
      window.temperatureChart.destroy();
    }
    if (window.humidityChart) {
      window.humidityChart.destroy();
    }
    if (window.weatherDoughnutChart) {
      window.weatherDoughnutChart.destroy();
    }
    if (window.pollutantBarChart) {
      window.pollutantBarChart.destroy();
    }

    // Temperature Line Chart
    const ctxLineTemp = document.getElementById('temperature-chart').getContext('2d');
    window.temperatureChart = new Chart(ctxLineTemp, {
      type: 'line',
      data: {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        datasets: [{
          label: 'Temperature (°C)',
          data: temperatureData,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: false,
        }],
      },
      options: {
        responsive: true,
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        },
        scales: {
          y: {
            beginAtZero: false,
          },
        },
      },
    });

    // Humidity Line Chart
    const ctxLineHum = document.getElementById('humidity-chart').getContext('2d');
    window.humidityChart = new Chart(ctxLineHum, {
      type: 'line',
      data: {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        datasets: [{
          label: 'Humidity (%)',
          data: humidityData,
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: false,
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Pollutant Bar Chart
    const ctxBar = document.getElementById('pollutant-bar-chart').getContext('2d');
    window.pollutantBarChart = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 5 }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: 'PM2.5',
            data: pollutantData.PM25,
            backgroundColor: 'rgba(255, 99, 132, 0.8)'
          },
          {
            label: 'PM10',
            data: pollutantData.PM10,
            backgroundColor: 'rgba(255, 159, 64, 0.8)'
          },
          {
            label: 'NOx',
            data: pollutantData.NOx,
            backgroundColor: 'rgba(255, 205, 86, 0.8)'
          },
          {
            label: 'NH3',
            data: pollutantData.NH3,
            backgroundColor: 'rgba(75, 192, 192, 0.8)'
          },
          {
            label: 'CO2',
            data: pollutantData.CO2,
            backgroundColor: 'rgba(54, 162, 235, 0.8)'
          },
          {
            label: 'SO2',
            data: pollutantData.SO2,
            backgroundColor: 'rgba(153, 102, 255, 0.8)'
          },
          {
            label: 'VOC',
            data: pollutantData.VOC,
            backgroundColor: 'rgba(201, 203, 207, 0.8)'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Weather Doughnut Chart
    const weatherCounts = weatherMockData.reduce((acc, weather) => {
      acc[weather] = (acc[weather] || 0) + 1;
      return acc;
    }, {});

    const ctxDoughnut = document.getElementById('weather-doughnut-chart').getContext('2d');
    window.weatherDoughnutChart = new Chart(ctxDoughnut, {
      type: 'doughnut',
      data: {
        labels: Object.keys(weatherCounts),
        datasets: [{
          label: 'Weather Distribution',
          data: Object.values(weatherCounts),
          backgroundColor: [
            'rgba(255, 205, 86, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(75, 192, 192, 0.8)',
          ],
        }],
      },
      options: {
        responsive: true,
      },
    });
  }

  // Initialize page with default view and fetch data for a default city
  $('#data-section').show();
  $('#visual-representation-section').hide();
  const defaultCityName = 'Seoul';
  fetchLatLonByCity(defaultCityName);

  // Handling tab navigation using navigation.js logic
  $('#nav-city-data').on('click', function() {
    $('#data-section').show();
    $('#visual-representation-section').hide();
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
  });

  $('#nav-visualize').on('click', function() {
    $('#data-section').hide();
    $('#visual-representation-section').show();
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
  });

  // Handling new city input and fetching data
  $('#fetch-temperature-data').on('click', function() {
    const cityName = $('#temperature-city-input').val();
    if (cityName) {
      fetchLatLonByCity(cityName);
    }
  });
});

