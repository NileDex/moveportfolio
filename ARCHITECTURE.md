# MoveLearnHub Architecture

This document outlines the architecture of the MoveLearnHub application, a cryptocurrency portfolio tracker built with React, TypeScript, and Vite.

## Project Structure

The project follows a standard React application structure, with the source code located in the `src` directory.

```
.
├── public/                # Static assets
└── src/
    ├── assets/              # Images, icons, and other static assets
    ├── components/          # Reusable React components
    │   ├── AccountSidebar/  # Components related to the account sidebar
    │   └── ...
    ├── types/               # TypeScript type definitions
    ├── util/                # Utility functions and helper modules
    ├── Walletchecks/        # Components related to wallet information
    ├── App.css              # Global application styles
    ├── App.tsx              # Main application component with routing
    ├── index.css            # Base styles
    ├── main.tsx             # Application entry point
    └── vite-env.d.ts        # Vite environment variables
```

## Core Components

*   **`main.tsx`**: The entry point of the application. It renders the `App` component into the DOM.
*   **`App.tsx`**: The main application component. It sets up the `react-router-dom` to handle navigation and defines the application's routes. It also includes the `Web3Sidebar` and the main content area.
*   **`Web3Sidebar.tsx`**: A persistent sidebar component that likely contains navigation links and wallet connection information.
*   **`DashboardHeader.tsx`**: The header for the main dashboard view.

## Routing and Navigation

The application uses `react-router-dom` for client-side routing. The routes are defined in `App.tsx` and include:

*   `/portfolio`: The public-facing landing page.
*   `/dashboard`: A protected route that displays the main user dashboard.
*   `/transactions`: A protected route to view transaction history.
*   `/NetworthDistribution`: A protected route to visualize portfolio distribution.
*   `/AccountNfts`: A protected route to display the user's NFTs.

Protected routes are only accessible when the user has connected their wallet. This is managed by the `ProtectedRoute` component in `App.tsx`.

## State Management

*   **Wallet State:** The `@razorlabs/razorkit` library manages the wallet connection state (e.g., `connected`, `walletAddress`).
*   **Component State:** Local component state is managed using React Hooks (`useState`, `useEffect`).
*   **GraphQL Cache:** Apollo Client provides a normalized cache to store the results of GraphQL queries, reducing redundant network requests.

## Data Fetching

The application uses **GraphQL** to fetch data from a backend API. The **Apollo Client** is configured in `src/util/graphqlClient.ts` and is used to send queries and mutations to the GraphQL endpoint.

## Styling

*   **CSS Modules:** The project uses CSS files alongside components (e.g., `PortfolioDashboard.css`) for component-specific styles.
*   **Global Styles:** Global styles are defined in `src/App.css` and `src/index.css`.
*   **Material-UI (MUI):** The application uses MUI for pre-built UI components and styling.

## Key Components Breakdown

*   **`Portfolio.tsx`**: The main component for the `/portfolio` route. It likely serves as the landing page and prompts users to connect their wallet.
*   **`Dashboard.tsx`**: The central component for the authenticated user experience. It likely aggregates data from other components to provide a complete portfolio overview.
*   **`WalletTransactions.tsx`**: Fetches and displays a list of transactions for the connected wallet.
*   **`NetworthDistribution.tsx`**: Uses a charting library (e.g., Recharts, Chart.js) to create visualizations of the user's asset allocation.
*   **`AccountNfts.tsx`**: Fetches and displays the NFTs owned by the user.
*   **`WalletSelector.tsx`**: A component that allows users to select and connect to their preferred wallet.
