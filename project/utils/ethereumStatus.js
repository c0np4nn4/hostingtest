$(document).ready(function() {
  $('.nav-link[data-target="ethereum-status"]').on('click', function(e) {
    e.preventDefault();
    loadEthereumStatus();
  });

  function loadEthereumStatus() {
    $('#content-area').html('<div class="loading">Loading Ethereum Status...</div>');

    // Get Ethereum price
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

          // Get latest blocks
          getLatestBlockFromAlchemy().then(latestBlock => {
            // Get latest transactions and blocks
            Promise.all([
              getLatestBlocks(latestBlock),
              getLatestTransactions(latestBlock)
            ]).then(([blocks, transactions]) => {
              const content = `
                <div class="ethereum-status container">
                  <div class="row mb-4">
                    <div class="col-md-12 text-center">
                      <div class="price-box d-flex align-items-center justify-content-center">
                        <img src="eth_logo.png" alt="Ethereum Logo" class="eth-logo me-3" style="width: 100px; height: auto;" />
                        <h2>Ethereum Price: $${price}</h2>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="block-box card p-3 mb-3">
                        <h3>📦 Recent Blocks</h3>
                        ${blocks.map(block => `
                          <div class="block-item card mt-2 p-2" data-block="${block.number}" style="cursor: pointer;">
                            <p>Block #${block.number}</p>
                            <p>Miner: ${block.miner}</p>
                            <p>Block Reward: ${(block.blockReward / 1e18).toFixed(3)} ETH</p>
                            <p>Time Since Mined: ${formatTimeElapsed(block.timestamp)}</p>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="transaction-box card p-3 mb-3">
                        <h3>📜 Recent Transactions</h3>
                        ${transactions.map(tx => `
                          <div class="transaction-item card mt-2 p-2" data-hash="${tx.hash}" style="cursor: pointer;">
                            <p>Transaction Hash: ${shortenAddress(tx.hash)}</p>
                            <p>From: ${shortenAddress(tx.from)}</p>
                            <p>To: ${shortenAddress(tx.to)}</p>
                            <p>Value: ${tx.value} ETH</p>
                            <p>Time Since Transaction: ${formatTimeElapsed(tx.timestamp)}</p>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                </div>
              `;
              $('#content-area').html(content);

              // Add click events for blocks and transactions
              $('.block-item').on('click', function() {
                const blockNumber = $(this).data('block');
                window.open(`https://sepolia.etherscan.io/block/${blockNumber}`, '_blank');
              });

              $('.transaction-item').on('click', function() {
                const txHash = $(this).data('hash');
                window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
              });
            });
          }).catch(() => {
            $('#content-area').html('<p>Error loading Ethereum status.</p>');
          });
        } else {
          $('#content-area').html('<p>Failed to load Ethereum price. Please try again later.</p>');
        }
      },
      error: function() {
        $('#content-area').html('<p>Failed to load Ethereum price. Please try again later.</p>');
      }
    });
  }

  async function getLatestBlockFromAlchemy() {
    const response = await fetch(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: ["latest", true],
      }),
    });

    const data = await response.json();
    if (data.result) {
      return parseInt(data.result.number, 16);
    } else {
      throw new Error('Failed to fetch the latest block');
    }
  }

  async function getLatestBlocks(latestBlockNumber) {
    const blocks = [];
    for (let i = 0; i < 5; i++) {
      const blockNumber = latestBlockNumber - i;
      const response = await $.ajax({
        url: API_URL,
        method: 'GET',
        data: {
          module: 'block',
          action: 'getblockreward',
          blockno: blockNumber,
          apikey: API_KEY
        }
      });

      if (response.status === '1') {
        blocks.push({
          number: response.result.blockNumber,
          miner: response.result.blockMiner,
          blockReward: response.result.blockReward,
          timestamp: response.result.timeStamp
        });
      }
    }
    return blocks;
  }

  async function getLatestTransactions(latestBlockNumber) {
    const response = await fetch(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: [toHex(latestBlockNumber), true],
      }),
    });

    const data = await response.json();
    if (data.result) {
      return data.result.transactions.slice(0, 5).map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: (parseInt(tx.value, 16) / 1e18).toFixed(3),
        timestamp: parseInt(data.result.timestamp, 16)
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

  function toHex(number) {
    return '0x' + number.toString(16);
  }
});

