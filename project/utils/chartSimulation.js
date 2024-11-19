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
  let dates = [];

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
          fetchAirPollutantData(city);
        } else {
          console.error('City not found');
          $('#vis-current-city').text('City not found');
        }
      },
      error: function(error) {
        console.error('Error fetching geocode data:', error);
        $('#vis-current-city').text('Error fetching geocode data');
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
        dates = data.list.slice(0, 30).map(entry => entry.dt_txt);
        if (dates.length !== temperatureData.length || dates.length !== humidityData.length) {
          console.error('Error: Labels and data lengths do not match');
          return;
        }
        renderCharts();
      },
      error: function(error) {
        console.error('Error fetching forecast data:', error);
      }
    });
  }

  function fetchAirPollutantData(city) {
    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = currentTime - (5 * 24 * 60 * 60);
    const pollutantUrl = `http://api.openweathermap.org/data/2.5/air_pollution/history?lat=${city.lat}&lon=${city.lon}&start=${startTime}&end=${currentTime}&appid=${API_KEY}`;
    $.ajax({
      url: pollutantUrl,
      method: 'GET',
      success: function(data) {
        if (data.list && data.list.length >= 5) {
          pollutantData.PM25 = data.list.slice(-5).map(entry => entry.components.pm2_5);
          pollutantData.PM10 = data.list.slice(-5).map(entry => entry.components.pm10);
          pollutantData.NOx = data.list.slice(-5).map(entry => entry.components.no2);
          pollutantData.NH3 = data.list.slice(-5).map(entry => entry.components.nh3);
          pollutantData.CO2 = data.list.slice(-5).map(entry => entry.components.co / 10);
          pollutantData.SO2 = data.list.slice(-5).map(entry => entry.components.so2);
          renderCharts();
        } else {
          console.error('Insufficient pollutant data available');
        }
      },
      error: function(error) {
        console.error('Error fetching air pollutant data:', error);
      }
    });
  }

  function renderCharts() {
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

    const ctxLineTemp = document.getElementById('temperature-chart').getContext('2d');
    window.temperatureChart = new Chart(ctxLineTemp, {
      type: 'line',
      data: {
        labels: dates.map(date => moment(date).format('YYYYMMDD')),
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
          easing: 'easeInBounce'
        },
        scales: {
          y: {
            beginAtZero: false,
          },
        },
      },
    });

    const ctxLineHum = document.getElementById('humidity-chart').getContext('2d');
    window.humidityChart = new Chart(ctxLineHum, {
      type: 'line',
      data: {
        labels: dates.map(date => moment(date).format('YYYYMMDD')),
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

    const ctxBar = document.getElementById('pollutant-bar-chart').getContext('2d');
    window.pollutantBarChart = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: dates.slice(-5).map(date => moment(date).format('YYYYMMDD')),
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

  $('#data-section').show();
  $('#visual-representation-section').hide();
  const defaultCityName = 'Seoul';
  fetchLatLonByCity(defaultCityName);

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

  $('#fetch-temperature-data').on('click', function() {
    const cityName = $('#temperature-city-input').val();
    if (cityName) {
      fetchLatLonByCity(cityName);
    }
  });
});

