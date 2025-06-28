# MoveLearnHub - Cryptocurrency Portfolio Tracker

MoveLearnHub is a web application that allows users to connect their cryptocurrency wallets to track their token balances, NFTs, and transaction history. It provides a user-friendly dashboard to visualize asset distribution and portfolio net worth.

## Features

*   **Wallet Connection:** Securely connect your wallet to view your assets.
*   **Portfolio Dashboard:** Get a comprehensive overview of your entire portfolio in one place.
*   **Token Balances:** View a detailed list of your tokens and their current market values.
*   **NFT Gallery:** Display your NFT collection.
*   **Transaction History:** Browse your recent transaction history.
*   **Net Worth Visualization:** See your portfolio's net worth distribution through interactive charts.

## Tech Stack

*   **Frontend:** React, TypeScript, Vite
*   **UI Components:** Material-UI (MUI), Recharts
*   **Data Fetching:** Apollo Client (GraphQL)
*   **Routing:** React Router
*   **Wallet Integration:** @razorlabs/razorkit

## Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd movelearnhub
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

To start the development server, run:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Available Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run lint`: Lints the codebase for potential errors.
*   `npm run preview`: Serves the production build locally.
