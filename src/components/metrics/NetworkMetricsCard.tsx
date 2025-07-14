import React from 'react';
import { FaExchangeAlt, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { NetworkMetrics } from '../../services/MovementDataService';
import MovementDataService from '../../services/MovementDataService';
import { Card } from '../ui/card';

export default function NetworkMetricsCard() {
  const [networkData, setNetworkData] = React.useState<NetworkMetrics | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [previousTxns, setPreviousTxns] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        const data = await MovementDataService.getNetworkMetrics();
        if (data && data.dailyTransactions !== previousTxns) {
          setPreviousTxns(data.dailyTransactions);
        }
        setNetworkData(data);
      } catch (error) {
        console.error('Error fetching network data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkData();
    const interval = setInterval(fetchNetworkData, 30000);
    return () => clearInterval(interval);
  }, [previousTxns]);

  const totalTransactions = networkData?.totalTransactions || 0;
  const dailyTransactions = networkData?.dailyTransactions || 0;
  const blockHeight = networkData?.blockHeight || 0;
  const tps = networkData?.tps || 0;
  const peakTps = networkData?.peakTps || 0;
  const trueTps = networkData?.trueTps || 0;
  const averageGasPrice = networkData?.averageGasPrice || 0;
  const networkUtilization = networkData?.networkUtilization || 0;

  // Calculate trend indicators
  const txnChange = dailyTransactions - previousTxns;
  const txnTrend = txnChange > 0 ? 'up' : txnChange < 0 ? 'down' : 'neutral';

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
        <FaExchangeAlt className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-foreground">Total Txn</span>
      </div>

      {/* Large Primary Value - Sui Style */}
      <div className="mb-6">
        <div className={`text-4xl font-bold text-foreground mb-1 ${loading ? 'animate-pulse' : ''}`}>
          {loading ? '-' : totalTransactions.toLocaleString()}
        </div>
      </div>

      {/* Nested Metrics Box - Sui Style */}
      <div className="bg-card/50 border border-border rounded-lg p-4 space-y-4">
        {/* Daily Transactions Row */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Daily Transactions</div>
          <div className="text-lg font-semibold text-foreground">
            {loading ? '-' : formatLargeNumber(dailyTransactions)}
          </div>
        </div>

        {/* TPS Current and Peak Row */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">TPS (Current)</div>
            <div className="text-base font-medium text-foreground">
              {loading ? '-' : (isNaN(tps) ? 'N/A' : tps.toFixed(1))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Peak TPS</div>
            <div className="text-base font-medium text-primary">
              {loading ? '-' : (isNaN(peakTps) ? 'N/A' : peakTps.toFixed(0))}
            </div>
          </div>
        </div>

        {/* True TPS and Network Utilization Row */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">True TPS</div>
            <div className="text-base font-medium text-foreground">
              {loading ? '-' : (isNaN(trueTps) ? 'N/A' : trueTps.toFixed(1))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Network Usage</div>
            <div className={`text-base font-medium ${
              isNaN(networkUtilization) ? 'text-foreground' :
              networkUtilization > 70 ? 'text-red-500' :
              networkUtilization > 50 ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {loading ? '-' : (isNaN(networkUtilization) ? 'N/A' : `${networkUtilization.toFixed(0)}%`)}
            </div>
          </div>
        </div>

        {/* Block Height and Average Gas Fee Row */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Block Height</div>
            <div className="text-base font-medium text-foreground">
              {loading ? '-' : blockHeight.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Avg Gas Fee</div>
            <div className="text-base font-medium text-foreground">
              {loading ? '-' : (isNaN(averageGasPrice) ? 'N/A' : `${averageGasPrice.toFixed(3)} MOVE`)}
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        {!loading && txnChange !== 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">24h Change</span>
            <div className={`flex items-center gap-1 text-xs ${
              txnTrend === 'up' ? 'text-green-500' :
              txnTrend === 'down' ? 'text-red-500' : 'text-muted-foreground'
            }`}>
              {txnTrend === 'up' ? <FaArrowUp className="h-3 w-3" /> :
               txnTrend === 'down' ? <FaArrowDown className="h-3 w-3" /> : null}
              <span className="font-medium">
                {txnChange > 0 ? '+' : ''}{formatLargeNumber(Math.abs(txnChange))}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
