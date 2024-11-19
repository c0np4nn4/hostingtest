$(document).ready(function() {
  // Default city name: Seoul
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
        // Update current city
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
        $('#pm25').text(`${data.list[0].components.pm2_5} µg/m³`);
        $('#pm10').text(`${data.list[0].components.pm10} µg/m³`);
        $('#nox').text(`${data.list[0].components.no} μg/m3`);
        $('#nh3').text(`${data.list[0].components.nh3} μg/m3`);
        $('#so2').text(`${data.list[0].components.so2} μg/m3`);
        $('#co').text(`${data.list[0].components.co} μg/m3`);
        $('#no2').text(`${data.list[0].components.no2} μg/m3`);
      },
      error: function(error) {
        console.error('Error fetching air pollution data:', error);
      }
    });
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

