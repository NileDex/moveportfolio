// import "./App.css"; // Removed - using only Tailwind + shadcn
import { BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useWallet } from "@razorlabs/razorkit";
import MainLayout from "./components/layout/MainLayout";
import { NavigationProvider } from "./contexts/NavigationContext";
import { AnimationProvider } from "./contexts/AnimationContext";

import Portfolio from "./components/PortFolio";
import Dashboard from "./components/Dashboard";
import WalletTransactions from "./Walletchecks/WalletTransactions";
import NetworthDistribution from "./components/NetworthDistribution";
import AccountNfts from "./components/AccountNft";
// import TestLayoutPage from "./components/TestLayoutPage";
import BlocksPage from "./components/BlocksPage";
import ValidatorsPage from "./components/ValidatorsPage";
import TokensPage from "./components/TokensPage";
import DevelopersPage from "./components/DevelopersPage";
import SearchPage from "./components/SearchPage";
import ToolsPage from "./components/ToolsPage";
import PricingPage from "./components/PricingPage";
import AccountsPage from "./components/AccountsPage";
import PackagesPage from "./components/PackagesPage";
import DeFiDashboard from "./components/charts/DeFiDashboard";
import AnimationDemo from "./components/AnimationDemo";
import TransactionsPage from "./components/TransactionsPage";

// New component imports for navigation fixes
import SubscriptionPlans from "./components/SubscriptionPlans";
import ApiDocsPage from "./components/ApiDocsPage";
import DeveloperCorner from "./components/DeveloperCorner";
import EcosystemLeaderboards from "./components/EcosystemLeaderboards";
import ExportDataTools from "./components/ExportDataTools";
import AdvancedSearch from "./components/AdvancedSearch";

function AppContent() {
  const { connected } = useWallet();

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!connected) {
      return <Navigate to="/portfolio" replace />;
    }
    return <>{children}</>;
  };

  return (
    <AnimationProvider>
      <NavigationProvider>
        <MainLayout>
          <Routes>
          <Route path="/portfolio" element={<Portfolio />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route
            path="/NetworthDistribution"
            element={
              <ProtectedRoute>
                <NetworthDistribution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AccountNfts"
            element={
              <ProtectedRoute>
                <AccountNfts/>
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/test-layout"
            element={
              <ProtectedRoute>
                <TestLayoutPage/>
              </ProtectedRoute>
            }
          /> */}

          {/* Explorer Routes */}
          <Route path="/blocks" element={<BlocksPage />} />
          <Route path="/validators" element={<ValidatorsPage />} />
          <Route path="/tokens" element={<TokensPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* New Navigation Routes */}
          <Route path="/premium" element={<SubscriptionPlans />} />
          <Route path="/api" element={<ApiDocsPage />} />
          <Route path="/docs" element={<DeveloperCorner />} />
          <Route path="/ecosystem" element={<EcosystemLeaderboards />} />
          <Route path="/export" element={<ExportDataTools />} />
          <Route path="/advanced-search" element={<AdvancedSearch onSearch={(query, filters) => console.log('Search:', query, filters)} />} />

          {/* Analytics Routes */}
          <Route path="/analytics" element={<div>Network Analytics - Coming Soon</div>} />
          <Route path="/analytics/gas-fees" element={<div>Gas Trends - Coming Soon</div>} />

          {/* Leaderboard Routes */}
          <Route path="/leaderboard" element={<div>Leaderboards - Coming Soon</div>} />
          <Route path="/leaderboard/accounts" element={<div>Top Accounts - Coming Soon</div>} />
          <Route path="/leaderboard/tokens" element={<div>Top Tokens - Coming Soon</div>} />
          <Route path="/leaderboard/validators" element={<div>Top Validators - Coming Soon</div>} />
          <Route path="/whale-tracking" element={<div>Whale Tracking - Coming Soon</div>} />
          <Route path="/nfts" element={<div>Top NFTs - Coming Soon</div>} />

          {/* Additional Routes */}
          <Route path="/watchlist" element={<div>Watchlist - Coming Soon</div>} />
          <Route path="/support" element={<div>Support - Coming Soon</div>} />
          <Route path="/defi" element={<div>DeFi Tools - Coming Soon</div>} />

          {/* Portfolio History Route */}
          <Route
            path="/portfolio/history"
            element={
              <ProtectedRoute>
                <WalletTransactions walletAddress={""} />
              </ProtectedRoute>
            }
          />

          {/* Animation Demo Routes */}
          <Route path="/defi-dashboard" element={<DeFiDashboard />} />
          <Route path="/animation-demo" element={<AnimationDemo />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </MainLayout>
      </NavigationProvider>
    </AnimationProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;