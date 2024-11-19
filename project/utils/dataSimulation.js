$(document).ready(function() {
  let currentCity = 'Seoul';
  $('#city-input').val(currentCity);
  $('#current-city').text(`Current city: ${currentCity}`);

  // Function to fetch air quality and weather data by city
  function fetchCityData(city) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    $.ajax({
      url: weatherUrl,
      method: 'GET',
      success: function(data) {
        $('#temperature').text(`${data.main.temp} °C`);
        $('#humidity').text(`${data.main.humidity} %`);
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        fetchAirPollutionData(lat, lon);
        currentCity = city;
        $('#current-city').text(`Current city: ${currentCity}`);
      },
      error: function(error) {
        console.error('Error fetching weather data:', error);
        alert('Failed to fetch data for the city. Please check the city name and try again.');
      }
    });
  }

  // Function to fetch air pollution data by latitude and longitude
  function fetchAirPollutionData(lat, lon) {
    const airPollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    $.ajax({
      url: airPollutionUrl,
      method: 'GET',
      success: function(data) {
        const pm25 = data.list[0].components.pm2_5;
        const pm10 = data.list[0].components.pm10;

        // Set pollution values
        $('#pm25').text(`${pm25} µg/m³`);
        $('#pm10').text(`${pm10} µg/m³`);

        // Get air quality grade and apply color coding
        const airQualityGrade = getAirQualityGrade(pm25, pm10);
        applyAirQualityColor(airQualityGrade);
      },
      error: function(error) {
        console.error('Error fetching air pollution data:', error);
      }
    });
  }

  // Function to get air quality grade based on PM2.5 and PM10
  function getAirQualityGrade(pm25, pm10) {
    if (pm25 <= 12 && pm10 <= 54) {
      return 'good 😊'; // Green
    } else if ((pm25 > 12 && pm25 <= 35.4) || (pm10 > 54 && pm10 <= 154)) {
      return 'moderate 😐'; // Orange
    } else {
      return 'unhealthy ☹️'; // Red
    }
  }

  // Function to apply color coding based on air quality grade
  function applyAirQualityColor(grade) {
    let color;
    switch (grade) {
      case 'good 😊':
        color = 'green';
        break;
      case 'moderate 😐':
        color = 'orange';
        break;
      case 'unhealthy ☹️':
        color = 'red';
        break;
      default:
        color = 'gray'; // Default color if the grade is unknown
    }

    // Apply color to the air quality display area
    $('#air-quality-status').css('color', color);
    $('#air-quality-status').text(`Air Quality: ${grade}`);
  }

  // Button click event to get data for input city
  $('#fetch-city-data').on('click', function() {
    const city = $('#city-input').val();
    if (city) {
      fetchCityData(city);
    } else {
      alert('Please enter a city name.');
    }
  });

  // Refresh data button click event
  $('#refresh-data').on('click', function() {
    if (currentCity) {
      fetchCityData(currentCity);
    } else {
      alert('Please enter a city name to refresh data.');
    }
  });

  // Initial fetch for default city
  fetchCityData(currentCity);
});

