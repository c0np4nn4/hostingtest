$(document).ready(function() {
  $('.nav-link[data-target="account-status"]').on('click', function(e) {
    e.preventDefault();
    loadAccountStatus();
  });

  function loadAccountStatus() {
    const content = `
      <h2>Account Status</h2>
      <form id="account-form" class="mb-3">
        <div class="mb-3">
          <label for="eth-address" class="form-label">Ethereum Address</label>
          <input type="text" id="eth-address" class="form-control" placeholder="Enter Ethereum Address">
        </div>
        <button type="submit" class="btn btn-primary">Get Balance</button>
      </form>
      <div id="account-result"></div>
    `;
    $('#content-area').html(content);

    $('#account-form').on('submit', function(e) {
      e.preventDefault();
      const address = $('#eth-address').val().trim();
      if (address) {
        getAccountBalance(address);
      } else {
        $('#account-result').html('<p>Please enter a valid Ethereum address.</p>');
      }
    });
  }

  function getAccountBalance(address) {
    $('#account-result').html('<div class="loading">Loading Account Balance...</div>');

    $.ajax({
      url: API_URL,
      method: 'GET',
      data: {
        module: 'account',
        action: 'balance',
        address: address,
        tag: 'latest',
        apikey: API_KEY
      },
      success: function(response) {
        if (response.status === '1') {
          const balanceInWei = response.result;
          const balanceInEth = (balanceInWei / 1e18).toFixed(4);
          const result = `
            <p>Address: ${address}</p>
            <p>Balance: ${balanceInEth} ETH</p>
          `;
          $('#account-result').html(result);
        } else {
          $('#account-result').html('<p>Error loading account balance.</p>');
        }
      },
      error: function() {
        $('#account-result').html('<p>Failed to load account balance. Please try again later.</p>');
      }
    });
  }
});

