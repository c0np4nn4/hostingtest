$(document).ready(function() {
  let currentCity = 'Seoul';
  $('#city-input').val(currentCity);
  $('#current-city').text(`Current city: ${currentCity}`);

  // Function to fetch air quality and weather data by city
  function fetchData() {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${localStorage.getItem("API_KEY")}&units=metric`;
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

  fetchData();
}
