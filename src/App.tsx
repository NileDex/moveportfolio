import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useWallet } from "@razorlabs/razorkit";
import { useState } from "react";

import Portfolio from "./components/PortFolio";
import Dashboard from "./components/Dashboard";
import Web3Sidebar from "./util/Web3Sidebar";
import WalletTransactions from "./Walletchecks/WalletTransactions";
import NetworthDistribution from "./components/NetworthDistribution";
import AccountNfts from "./components/AccountNft";
import DashboardHeader from "./components/DashboardHeader";

function AppContent() {
  const { connected } = useWallet();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!connected) {
      return <Navigate to="/portfolio" replace />;
    }
    return <>{children}</>;
  };

  const shouldShowDashboardHeader = connected && location.pathname !== '/portfolio';

  return (
    <div className="App">
      <Web3Sidebar 
        mobileOpen={mobileSidebarOpen} 
        setMobileOpen={setMobileSidebarOpen} 
      />
      <div className={`main-content-wrapper ${mobileSidebarOpen ? 'sidebar-open' : ''}`}>
        {shouldShowDashboardHeader && (
          <DashboardHeader toggleSidebar={toggleSidebar} />
        )}
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
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <WalletTransactions walletAddress={""} />
              </ProtectedRoute>
            }
          />
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
          <Route path="/" element={<Navigate to="/portfolio" replace />} />
          <Route path="*" element={<Navigate to="/portfolio" replace />} />
        </Routes>
      </div>
    </div>
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