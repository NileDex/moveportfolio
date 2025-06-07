import { useState, useEffect, useRef } from "react";
import { useWallet } from "@razorlabs/razorkit";
import { useAccount, useAccountBalance } from "@razorlabs/razorkit";
import { useNavigate } from "react-router-dom";
import {
  FaCoins,
  FaExchangeAlt,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle
} from "react-icons/fa";

import '../App.css';
import CallAction from "./CallAction";


const LOW_BALANCE_THRESHOLD = 10;
const MAX_BALANCE_FOR_PROGRESS = 100;

export default function Dashboard() {
  const { connected } = useWallet();
  const navigate = useNavigate();
  const { isConnected, isConnecting } = useAccount();
  const { loading: balanceLoading, balance } = useAccountBalance();
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [showUSD, setShowUSD] = useState(() => {
    const savedPref = localStorage.getItem("currencyDisplay");
    return savedPref ? savedPref === "USD" : false;
  });
  const [movePrice, setMovePrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const riskCardRef = useRef<HTMLDivElement>(null);

  const formatBalance = (rawBalance: number | undefined): number => {
    if (rawBalance === undefined) return 0;
    return Number(rawBalance) / 100000000;
  };

  const calculateMoveProgress = () => {
    const moveBalance = formatBalance(Number(balance));
    if (moveBalance <= 0) return 0;
    const progress = (moveBalance / MAX_BALANCE_FOR_PROGRESS) * 100;
    return Math.min(progress, 100);
  };

  useEffect(() => {
    const fetchMovePrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=movement&vs_currencies=usd&include_24hr_change=true"
        );
        const data = await response.json();
        setMovePrice(data.movement?.usd || null);
        setPriceChange(data.movement?.usd_24h_change || null);
      } catch (error) {
        console.error("Error fetching MOVE price:", error);
      }
    };

    fetchMovePrice();
    const interval = setInterval(fetchMovePrice, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const progress = calculateMoveProgress();
    if (riskCardRef.current) {
      riskCardRef.current.style.setProperty('--progress-percent', `${progress}%`);
    }
  }, [balance]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingConnection(false);
    }, 3000);
  
    if (!connected && !isConnected && !isConnecting) {
      navigate("/");
    } else if (connected || isConnected) {
      setIsCheckingConnection(false);
      clearTimeout(timer);
    }
  
    return () => clearTimeout(timer);
  }, [connected, isConnected, isConnecting, navigate]);

  const toggleCurrencyDisplay = () => {
    const newValue = !showUSD;
    setShowUSD(newValue);
    localStorage.setItem("currencyDisplay", newValue ? "USD" : "MOVE");
  };

  if (isCheckingConnection || isConnecting) {
    return (
      <div className="loading-container">
        <p>Checking wallet connection...</p>
      </div>
    );
  }

  if (!connected && !isConnected) {
    return null;
  }

  const moveBalance = formatBalance(Number(balance));
  const usdBalance = movePrice !== null ? moveBalance * movePrice : null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        <div className="main-content">
          <div className="metrics-section">
            <div className="metric-card">
              <div className="metric-header">
                <FaCoins size={20} />
                <span>Current Balance</span>
                <button
                  className="currency-toggle"
                  onClick={toggleCurrencyDisplay}
                  title="Toggle currency display"
                >
                  <FaExchangeAlt size={14} />
                </button>
              </div>
              <div className="metric-value">
                {balanceLoading
                  ? "Loading..."
                  : showUSD && usdBalance !== null
                  ? `$${usdBalance.toFixed(2)} USD`
                  : `${moveBalance.toFixed(2)} MOVE`}
              </div>
              {usdBalance !== null && !showUSD && (
                <div className="metric-subvalue">
                  ≈ ${usdBalance.toFixed(2)} USD
                </div>
              )}
              {usdBalance !== null && showUSD && (
                <div className="metric-subvalue">
                  ≈ {moveBalance.toFixed(2)} MOVE
                </div>
              )}
            </div>

            <div 
              className={`metric-card move-balance-risk-card ${moveBalance < LOW_BALANCE_THRESHOLD ? 'low-balance' : ''}`}
              ref={riskCardRef}
            >
              <div className="metric-header">
                <FaExclamationTriangle size={20} />
                <span>MOVE Balance Risk</span>
              </div>
              <div className="move-balance-progress-row">
                <div className="move-balance-progress-info">
                  <div className="progress-header">
                    <span>{moveBalance.toFixed(2)} / {MAX_BALANCE_FOR_PROGRESS} MOVE</span>
                    <span className="risk-level">
                      {moveBalance < LOW_BALANCE_THRESHOLD ? "High Risk" : "Normal"}
                    </span>
                  </div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${calculateMoveProgress()}%` }}
                    />
                    <div 
                      className="progress-marker"
                      style={{ left: `${calculateMoveProgress()}%` }}
                    >
                      <div className="progress-value">{moveBalance.toFixed(0)} MOVE</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="metric-card price-card">
              <div className="metric-header">
                <FaCoins size={20} />
                <span>MOVE Price</span>
              </div>
              <div className="metric-value price-value">
                {movePrice !== null ? `$${movePrice.toFixed(4)}` : "Loading..."}
              </div>
              {priceChange !== null && (
                <div
                  className={`price-change ${
                    priceChange >= 0 ? "positive" : "negative"
                  }`}
                >
                  {priceChange >= 0 ? (
                    <FaArrowUp size={18} />
                  ) : (
                    <FaArrowDown size={18} />
                  )}
                  <span className="change-value">
                    {Math.abs(priceChange).toFixed(2)}%
                  </span>
                  <span className="change-label">24h</span>
                </div>
              )}
            </div>
          </div>
          
          <CallAction/>
        </div>
      </div>
    </div>
  );
}