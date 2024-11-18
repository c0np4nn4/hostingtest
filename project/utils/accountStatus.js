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
        <button type="submit" class="btn btn-primary">Get Account Info</button>
      </form>
      <div id="account-result"></div>
    `;
    $('#content-area').html(content);

    $('#account-form').on('submit', function(e) {
      e.preventDefault();
      const address = $('#eth-address').val().trim().toLowerCase();
      if (address) {
        getAccountInfo(address);
      } else {
        $('#account-result').html('<p>Please enter a valid Ethereum address.</p>');
      }
    });
  }

  function getAccountInfo(address) {
    $('#account-result').html('<div class="loading">Loading Account Info...</div>');

    // Get ETH balance
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
          const balanceInEth = (balanceInWei / 1e18).toFixed(8);

          // Get token holdings and recent transactions
          Promise.all([getTokenHoldings(address), getRecentTransactions(address)])
            .then(([tokenHoldings, transactions]) => {
              const result = `
                <div class="account-info-box border p-3 mb-3">
                  <h3>ℹ️ Account Info</h3>
                  <p><strong>Address:</strong> ${address}</p>
                  <p><strong>Balance:</strong> ${balanceInEth} ETH</p>
                </div>
                <div class="token-holdings-box border p-3 mb-3">
                  <h3>💰 Token Holdings</h3>
                  <div class="token-holdings">
                    ${tokenHoldings.length > 0 ? tokenHoldings.map(token => `
                      <div class="token-item">
                        <p>Token: ${token.name} (${token.symbol})</p>
                        <p>Balance: ${token.balance}</p>
                      </div>
                    `).join('') : '<p>No tokens found.</p>'}
                  </div>
                </div>
                <div class="transaction-list-box border p-3 mb-3">
                  <h3>📜 Recent Transactions</h3>
                  <div class="transaction-list">
                    ${transactions.map(tx => `
                      <div class="transaction-item card mt-2 p-2" style="cursor: pointer;" onclick="window.open('https://sepolia.etherscan.io/tx/${tx.hash}', '_blank')">
                        <p><strong>Transaction Hash:</strong> ${shortenAddress(tx.hash)}</p>
                        <p><strong>From:</strong> ${shortenAddress(tx.from)}</p>
                        <p><strong>To:</strong> ${shortenAddress(tx.to)}</p>
                        <p><strong>Value:</strong> ${tx.value} ETH</p>
                        <p><strong>Time Since Transaction:</strong> ${formatTimeElapsed(tx.timestamp)}</p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
              $('#account-result').html(result);
            });
        } else {
          $('#account-result').html('<p>Error loading account balance.</p>');
        }
      },
      error: function() {
        $('#account-result').html('<p>Failed to load account balance. Please try again later.</p>');
      }
    });
  }

  async function getTokenHoldings(address) {
    // Use Alchemy API to get token balances
    const response = await fetch(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "alchemy_getTokenBalances",
        params: [address],
      }),
    });

    const data = await response.json();
    if (data.result && data.result.tokenBalances) {
      return data.result.tokenBalances.map(token => ({
        name: token.name || "Unknown Token",
        symbol: token.symbol || "UNK",
        balance: (parseInt(token.tokenBalance, 16) / 1e18).toFixed(4)
      }));
    } else {
      return [];
    }
  }

  async function getRecentTransactions(address) {
    const response = await $.ajax({
      url: API_URL,
      method: 'GET',
      data: {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        sort: 'desc',
        apikey: API_KEY
      }
    });

    if (response.status === '1') {
      return response.result.slice(0, 5).map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: (tx.value / 1e18).toFixed(3),
        timestamp: parseInt(tx.timeStamp)
      }));
    } else {
      return [];
    }
  }

  function shortenAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function formatTimeElapsed(timestamp) {
    const elapsedSeconds = Math.floor((Date.now() / 1000) - timestamp);
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    return `${hours}h ${minutes}m ago`;
  }
});
