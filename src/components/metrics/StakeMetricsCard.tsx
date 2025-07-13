import React from 'react';
import { FaLock, FaArrowUp, FaArrowDown, FaUsers, FaPercentage } from 'react-icons/fa';
import MovementDataService, { StakeMetrics } from '../../services/MovementDataService';
import { Card } from '../ui/card';

export default function StakeMetricsCard() {
  const [stakeData, setStakeData] = React.useState<StakeMetrics>({
    totalStake: 0,
    activeStake: 0,
    inactiveStake: 0,
    stakeRate: 0,
    totalValidators: 0,
    stakingApy: 0,
    lastEpochRewards: 0,
    totalRewards: 0
  });
  const [loading, setLoading] = React.useState(true);
  const [previousStake, setPreviousStake] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchStakeData = async () => {
      try {
        const data = await MovementDataService.getStakeMetrics();
        if (data && data.totalStake !== previousStake) {
          setPreviousStake(data.totalStake);
        }
        setStakeData(data);
      } catch (error) {
        console.error('Error fetching stake data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStakeData();
    const interval = setInterval(fetchStakeData, 60000);
    return () => clearInterval(interval);
  }, [previousStake]);

  const activePercentage = stakeData.totalStake > 0
    ? ((stakeData.activeStake / stakeData.totalStake) * 100).toFixed(1)
    : '0';

  const inactivePercentage = stakeData.totalStake > 0
    ? ((stakeData.inactiveStake / stakeData.totalStake) * 100).toFixed(1)
    : '0';

  // Format large numbers (like 1B, 1M) with NaN handling
  const formatLargeNumber = (num: number) => {
    if (isNaN(num)) return 'N/A';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // Calculate trend indicators
  const stakeChange = stakeData.totalStake - previousStake;
  const stakeTrend = stakeChange > 0 ? 'up' : stakeChange < 0 ? 'down' : 'neutral';
  const stakeHealthy = parseFloat(activePercentage) > 80;

  return (
    <Card className="p-6">
      {/* Main Header - Sui Style */}
      <div className="flex items-center gap-2 mb-4">
        <FaLock className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-foreground">Total Stake</span>
      </div>

      {/* Large Primary Value - Sui Style */}
      <div className="mb-6">
        <div className={`text-4xl font-bold text-foreground mb-1 ${loading ? 'animate-pulse' : ''}`}>
          {loading ? '-' : formatLargeNumber(stakeData.totalStake)}
        </div>
      </div>

      {/* Nested Metrics Box - Sui Style */}
      <div className="bg-card/50 border border-border rounded-lg p-4 space-y-4">
        {/* Stake Value Row */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Stake Value</div>
          <div className="text-lg font-semibold text-foreground">
            {loading ? '-' : (isNaN(stakeData.totalStake) ? 'N/A' : `$${(stakeData.totalStake * 0.85).toLocaleString()}`)}
          </div>
        </div>

        {/* Active Stake and Validators Row */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Active Stake</div>
            <div className="text-base font-medium text-foreground">
              {loading ? '-' : formatLargeNumber(stakeData.activeStake)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1 justify-end">
              <FaUsers className="h-3 w-3" />
              Validators
            </div>
            <div className="text-base font-medium text-primary">
              {loading ? '-' : (isNaN(stakeData.totalValidators) ? 'N/A' : stakeData.totalValidators.toLocaleString())}
            </div>
          </div>
        </div>

        {/* Staking APY and Last Epoch Rewards Row */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <FaPercentage className="h-3 w-3" />
              Staking APY
            </div>
            <div className="text-base font-medium text-green-500">
              {loading ? '-' : (isNaN(stakeData.stakingApy) ? 'N/A' : `${stakeData.stakingApy.toFixed(2)}%`)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Last Epoch Rewards</div>
            <div className="text-base font-medium text-foreground">
              {loading ? '-' : formatLargeNumber(stakeData.lastEpochRewards)}
            </div>
          </div>
        </div>

        {/* Active Percentage and Delinquent Stake Row */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Active %</div>
            <div className={`text-base font-medium ${
              isNaN(stakeData.totalStake) || isNaN(stakeData.activeStake) ? 'text-foreground' :
              stakeHealthy ? 'text-green-500' : 'text-red-500'
            }`}>
              {loading ? '-' : (isNaN(stakeData.totalStake) || isNaN(stakeData.activeStake) ? 'N/A' : `${activePercentage}%`)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Delinquent Stake</div>
            <div className="text-base font-medium text-red-500">
              {loading ? '-' : formatLargeNumber(stakeData.inactiveStake)}
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        {!loading && stakeChange !== 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">24h Change</span>
            <div className={`flex items-center gap-1 text-xs ${
              stakeTrend === 'up' ? 'text-green-500' :
              stakeTrend === 'down' ? 'text-red-500' : 'text-muted-foreground'
            }`}>
              {stakeTrend === 'up' ? <FaArrowUp className="h-3 w-3" /> :
               stakeTrend === 'down' ? <FaArrowDown className="h-3 w-3" /> : null}
              <span className="font-medium">
                {stakeChange > 0 ? '+' : ''}{formatLargeNumber(Math.abs(stakeChange))}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
