import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import MovementDataService from '../services/MovementDataService';
import TokenLogo from '../assets/TokenLogo.png';

export interface MovePriceCardProps {
  className?: string;
}

interface PriceData {
  price: number;
  change24h: number;
  marketCap: number;
}

const MovePriceCard: React.FC<MovePriceCardProps> = ({ className }) => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const priceResult = await MovementDataService.getMovePrice();
        setPriceData(priceResult);
      } catch (err) {
        console.error('Error fetching MOVE price data:', err);
        setError('Failed to load price data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border animate-pulse ${className || ''}`}>
      <div className="w-5 h-5 rounded-full bg-muted"></div>
      <div className="text-sm text-muted-foreground">Loading...</div>
    </div>;
  }

  if (error || !priceData) {
    return <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border ${className || ''}`}>
      <div className="w-5 h-5 rounded-full bg-destructive/20"></div>
      <div className="text-sm text-destructive">Price unavailable</div>
    </div>;
  }

  const isPositive = priceData.change24h >= 0;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border ${className || ''}`}>
      <img src={TokenLogo} alt="MOVE Token" className="w-5 h-5 rounded-full" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">${priceData.price.toFixed(4)}</span>
        <span className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <FaArrowUp className="w-2.5 h-2.5" /> : <FaArrowDown className="w-2.5 h-2.5" />}
          {Math.abs(priceData.change24h).toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

export default MovePriceCard;
