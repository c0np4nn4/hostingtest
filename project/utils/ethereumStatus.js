$(document).ready(function() {
  $('.nav-link[data-target="ethereum-status"]').on('click', function(e) {
    e.preventDefault();
    loadEthereumStatus();
  });

  function loadEthereumStatus() {
    $('#content-area').html('<div class="loading">Loading Ethereum Status...</div>');

    $.ajax({
      url: API_URL,
      method: 'GET',
      data: {
        module: 'stats',
        action: 'ethprice',
        apikey: API_KEY
      },
      success: function(response) {
        if (response.status === '1') {
          const price = response.result.ethusd;
          const content = `
            <h2>Ethereum Status</h2>
            <p>Current Ethereum Price: $${price}</p>
          `;
          $('#content-area').html(content);
        } else {
          $('#content-area').html('<p>Error loading Ethereum status.</p>');
        }
      },
      error: function() {
        $('#content-area').html('<p>Failed to load Ethereum status. Please try again later.</p>');
      }
    });
  }
});
