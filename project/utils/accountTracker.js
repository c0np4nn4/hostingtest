$(document).ready(function() {
  $('.nav-link[data-target="account-tracker"]').on('click', function(e) {
    e.preventDefault();
    loadAccountTracker();
  });

  async function loadAccountTracker() {
    const content = `
      <h2>Account Tracker</h2>
      <form id="tracker-form" class="mb-3">
        <div class="mb-3">
          <label for="eth-address" class="form-label">Ethereum Address</label>
          <input type="text" id="eth-address" class="form-control" placeholder="Enter Ethereum Address">
        </div>
        <button type="submit" class="btn btn-primary">Track!</button>
      </form>
      <div id="graph-area" style="width: 100%; height: 400px; border: 1px solid lightgreen;"></div>
    `;
    $('#content-area').html(content);

    // 폼 제출 이벤트 핸들러 설정
    $('#tracker-form').on('submit', async function(e) {
      e.preventDefault();
      const address = $('#eth-address').val().trim().toLowerCase();
      if (address) {
        await getTransactionsAndDrawGraph(address);
      } else {
        $('#graph-area').html('<p style="font-style: italic; color: gray;">Please enter a valid Ethereum address.</p>');
      }
    });
  }

  async function getTransactionsAndDrawGraph(address) {
    $('#graph-area').html('<div class="loading" style="font-style: italic; color: gray;">Loading Transaction Graph...</div>');

    try {
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
        const transactions = response.result.slice(0, 5);
        const graphData = { nodes: [], links: [] };
        const processedAddresses = new Map(); // Map to store addresses and types

        // 메인 주소 (A) 추가
        const mainAddressShort = shortenAddress(address);
        graphData.nodes.push({ id: mainAddressShort, type: 'EOA', isMain: true });
        processedAddresses.set(address, { type: 'EOA', shortId: mainAddressShort });

        // 트랜잭션을 통한 노드 및 링크 추가
        await Promise.all(transactions.map(async (tx) => {
          const from = tx.from.toLowerCase();
          const to = tx.to.toLowerCase();
          const value = parseFloat((tx.value / 1e18).toFixed(3));

          if (!processedAddresses.has(to)) {
            const type = await getAddressType(to);
            const toShort = shortenAddress(to);
            processedAddresses.set(to, { type, shortId: toShort });
          }

          if (!processedAddresses.has(from)) {
            const fromType = await getAddressType(from);
            const fromShort = shortenAddress(from);
            processedAddresses.set(from, { type: fromType, shortId: fromShort });
          }

          // Only add the node if it hasn't been added before
          if (!graphData.nodes.some(node => node.id === processedAddresses.get(to).shortId)) {
            graphData.nodes.push({ id: processedAddresses.get(to).shortId, type: processedAddresses.get(to).type });
          }

          if (!graphData.nodes.some(node => node.id === processedAddresses.get(from).shortId)) {
            graphData.nodes.push({ id: processedAddresses.get(from).shortId, type: processedAddresses.get(from).type });
          }

          graphData.links.push({ source: processedAddresses.get(from).shortId, target: processedAddresses.get(to).shortId, value });
        }));

        drawGraph(graphData);
      } else {
        $('#graph-area').html('<p style="font-style: italic; color: red;">Error loading transactions for the account.</p>');
      }
    } catch (error) {
      $('#graph-area').html('<p style="font-style: italic; color: red;">Failed to load transactions. Please try again later.</p>');
    }
  }

  async function getAddressType(address) {
    try {
      const response = await $.ajax({
        url: API_URL,
        method: 'GET',
        data: {
          module: 'contract',
          action: 'getabi',
          address: address,
          apikey: API_KEY
        }
      });

      if (response.status === '1') {
        return 'Contract';
      } else {
        return 'EOA';
      }
    } catch (error) {
      return 'unknown';
    }
  }

  function shortenAddress(address) {
    return `${address.slice(2, 6)}...${address.slice(-4)}`;
  }

  function drawGraph(graphData) {
    $('#graph-area').html(''); // 이전 그래프 클리어

    const width = $('#graph-area').width();
    const height = $('#graph-area').height();

    const svg = d3.select("#graph-area").append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(d3.zoom().on("zoom", function(event) {
        svg.attr("transform", event.transform);
      }))
      .append("g");

    const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => d.id).distance(50))
      .force("charge", d3.forceManyBody().strength(-150))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graphData.links)
      .enter().append("line")
      .attr("stroke-width", d => d.value * 2 + 1) // 링크 두께를 거래 값에 비례하게 설정
      .attr("stroke", "#999");

    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graphData.nodes)
      .enter().append("circle")
      .attr("r", 10)
      .attr("fill", d => d.isMain ? 'red' : (d.type === 'Contract' ? 'purple' : 'green'))
      .attr("stroke", d => d.isMain ? 'black' : 'none')
      .attr("stroke-width", d => d.isMain ? 3 : 1)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // 각 노드 위에 텍스트 레이블 추가
    svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(graphData.nodes)
      .enter().append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(d => d.id);

    simulation
      .nodes(graphData.nodes)
      .on("tick", ticked);

    simulation.force("link")
      .links(graphData.links);

    function ticked() {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      svg.selectAll("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    }

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }
});

