import React from 'react';
import { FaCoins, FaUsers, FaBox } from 'react-icons/fa';
import { NetworkMetrics, MovePriceData } from '../../services/MovementDataService';
import MovementDataService from '../../services/MovementDataService';
import { Card } from '../ui/card';

export default function MoveSupplyCard() {
  const [metrics, setMetrics] = React.useState<NetworkMetrics | undefined>(undefined);
  const [priceData, setPriceData] = React.useState<MovePriceData | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [previousSupply, setPreviousSupply] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [networkMetrics, movePrice] = await Promise.all([
          MovementDataService.getNetworkMetrics(),
          MovementDataService.getMovePrice()
        ]);

        if (networkMetrics && networkMetrics.totalSupply !== previousSupply) {
          setPreviousSupply(networkMetrics.totalSupply);
        }
        setMetrics(networkMetrics);
        setPriceData(movePrice);
      } catch (error) {
        console.error('Error fetching supply data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [previousSupply]);

  const totalSupply = metrics?.totalSupply || 0;
  const circulatingSupply = metrics?.circulatingSupply || 0;
  const nonCirculatingSupply = totalSupply - circulatingSupply;
  const circulatingPercentage = totalSupply > 0 ? ((circulatingSupply / totalSupply) * 100).toFixed(1) : '0';
  const nonCirculatingPercentage = totalSupply > 0 ? ((nonCirculatingSupply / totalSupply) * 100).toFixed(1) : '0';

  // Calculate trend (simplified - in real app this would compare to previous period)
  const supplyChange = totalSupply - previousSupply;
  const supplyTrend = supplyChange > 0 ? 'up' : supplyChange < 0 ? 'down' : 'neutral';

  // Format large numbers (like 1B, 1M) with NaN handling
  const formatLargeNumber = (num: number) => {
    if (isNaN(num)) return 'N/A';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <Card className="p-6">
      {/* Main Header - Sui Style */}
      <div className="flex items-center gap-2 mb-4">
        <FaCoins className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-foreground">MOVE Total Supply</span>
      </div>

      {/* Large Primary Value - Sui Style */}
      <div className="mb-6">
        <div className={`text-4xl font-bold text-foreground mb-1 ${loading ? 'animate-pulse' : ''}`}>
          {loading ? '-' : formatLargeNumber(totalSupply)}
        </div>
      </div>

      {/* Nested Metrics Box - Sui Style */}
      <div className="bg-card/50 border border-border rounded-lg p-4 space-y-4">
        {/* Market Cap Row */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
          <div className="text-lg font-semibold text-foreground">
            {loading ? '-' : (priceData?.marketCap ? `$${priceData.marketCap.toLocaleString()}` : 'N/A')}
          </div>
        </div>

        {/* Circulating Supply and Price Row */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Circulating Supply</div>
            <div className="text-base font-medium text-foreground">
              {loading ? '-' : formatLargeNumber(circulatingSupply)} ({loading ? '-' : `${circulatingPercentage}%`})
            </div>
          </div>
        </div>

        {/* Non-Circulating Supply Row */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Non-Circulating Supply</div>
            <div className="text-base font-medium text-foreground">
              {loading ? '-' : formatLargeNumber(totalSupply - circulatingSupply)} ({loading ? '-' : `${nonCirculatingPercentage}%`})
            </div>
          </div>
        </div>

        {/* Total Accounts and Packages Row */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <FaUsers className="h-3 w-3" />
              Total Accounts
            </div>
            <div className="text-base font-medium text-foreground">
              {loading ? '-' : formatLargeNumber(metrics?.activeAccounts || 0)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1 justify-end">
              <FaBox className="h-3 w-3" />
              Total Packages
            </div>
            <div className="text-base font-medium text-foreground">
              {loading ? '-' : formatLargeNumber(metrics?.totalPackages || 0)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
