# My Ethereum Dashboard

## Overview

**My Ethereum Dashboard** is a web application that provides users with a comprehensive overview of Ethereum's current state, account information, and transaction flows. It aims to present key information about the Ethereum blockchain in a user-friendly manner, leveraging data visualization to help users understand activity patterns effectively.

## How to Run
1. Clone this repository to your local machine.
2. Set up an API key from [Etherscan](https://etherscan.io) and add it to your `utils/constants.js` file. (if none, you should make one!)
3. Open `index.html`!


## Features

### 1. Ethereum Status
Get real-time information about the Ethereum network, including:
- **Current Ethereum Price**: Displayed in major fiat currencies.
- **Latest Block Information**: Details of the most recently mined block, including block number and miner information.
- **Recent Transactions**: A list of the latest transactions on the Ethereum network, with key details such as sender, recipient, and transaction value.

### 2. Account Status
Provide insights into specific Ethereum accounts, regardless of whether they are an **Externally Owned Account (EOA)** or a **Smart Contract**:
- **Account Balance**: Shows the current balance of ETH for the given account.
- **Recent Transactions**: Lists the most recent transactions involving this account, including details such as value, transaction hash, and timestamp.

### 3. Account Tracker
Visualize the transaction network for a given Ethereum account:
- **Network Visualization**: Displays a graphical representation of the relationships between an account and other connected accounts that have had recent transactions.
- This visualization aims to make it easier to understand the **flow of funds** between accounts.
- Inspired by **Chainalysis**, this feature can be helpful in identifying patterns and relationships in the Ethereum ecosystem.

## Dependencies
- **Ethereum API**: Utilizes Etherscan API to retrieve blockchain data.
- **D3.js**: Used for graph visualization in the Account Tracker feature.
- **jQuery** and **Bootstrap**: For frontend interactivity and styling.

## Usage
1. **Navigate** to the desired feature via the sidebar options.
2. Enter an Ethereum address in the `Account Status` or `Account Tracker` sections to explore specific accounts.
3. Use the Ethereum Status section for up-to-date information on the blockchain.

## Credits
The **Account Tracker** feature was inspired by **Chainalysis**, a leader in blockchain analytics, 
providing the inspiration for visualizing Ethereum transaction flows in a clear and intuitive way.
