import React from 'react';
import { FaClock, FaArrowUp, FaCheckCircle } from 'react-icons/fa';
import MovementDataService, { EpochMetrics } from '../../services/MovementDataService';
import { Card } from '../ui/card';

export default function CurrentEpochCard() {
  const [epochData, setEpochData] = React.useState<EpochMetrics>({
    currentEpoch: 0,
    epochProgress: 0,
    timeRemaining: '',
    epochStartTime: '',
    currentCheckpoint: 0,
    slotsInEpoch: 0,
    currentSlot: 0
  });
  const [loading, setLoading] = React.useState(true);
  const [previousEpoch, setPreviousEpoch] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchEpochData = async () => {
      try {
        const data = await MovementDataService.getEpochMetrics();

        if (data && data.currentEpoch !== previousEpoch) {
          setPreviousEpoch(data.currentEpoch);
        }

        setEpochData(data);
      } catch (error) {
        console.error('Error fetching epoch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpochData();
    const interval = setInterval(fetchEpochData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [previousEpoch]);

  // Calculate progress indicators
  const isNewEpoch = epochData.currentEpoch > previousEpoch;

  return (
    <Card className="p-6">
      {/* Main Header - Sui Style */}
      <div className="flex items-center gap-2 mb-4">
        <FaClock className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-foreground">Current Epoch</span>
      </div>

      {/* Large Primary Value - Sui Style */}
      <div className="mb-6">
        <div className={`text-4xl font-bold text-foreground mb-1 ${loading ? 'animate-pulse' : ''}`}>
          {loading ? '-' : (isNaN(epochData.currentEpoch) ? 'N/A' : epochData.currentEpoch.toLocaleString())}
        </div>
      </div>

      {/* Nested Metrics Box - Sui Style */}
      <div className="bg-card/50 border border-border rounded-lg p-4 space-y-4">
        {/* Progress Row */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Epoch Progress</div>
          <div className="text-lg font-semibold text-foreground">
            {loading ? '-' : (isNaN(epochData.epochProgress) ? 'N/A' : `${epochData.epochProgress.toFixed(1)}%`)}
          </div>
        </div>

        {/* Time Remaining and Started At Row */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Time Remaining</div>
            <div className="text-base font-medium text-foreground">
              {loading ? '-' : (epochData.timeRemaining || 'N/A')}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Started At</div>
            <div className="text-base font-medium text-foreground">
              {loading ? '-' : (epochData.epochStartTime || 'N/A')}
            </div>
          </div>
        </div>

        {/* Current Checkpoint and Current Slot Row */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <FaCheckCircle className="h-3 w-3" />
              Checkpoint
            </div>
            <div className="text-base font-medium text-foreground">
              {loading ? '-' : (isNaN(epochData.currentCheckpoint) ? 'N/A' : epochData.currentCheckpoint.toLocaleString())}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Current Slot</div>
            <div className="text-base font-medium text-foreground">
              {loading ? '-' : (isNaN(epochData.currentSlot) ? 'N/A' : epochData.currentSlot.toLocaleString())}
            </div>
          </div>
        </div>

        {/* Slots in Epoch Row */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Slots in Epoch</div>
          <div className="text-base font-medium text-foreground">
            {loading ? '-' : (isNaN(epochData.slotsInEpoch) ? 'N/A' : epochData.slotsInEpoch.toLocaleString())}
          </div>
        </div>

        {/* New Epoch Indicator */}
        {!loading && isNewEpoch && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Status</span>
            <div className="flex items-center gap-1 text-xs text-green-500">
              <FaArrowUp className="h-3 w-3" />
              <span className="font-medium">
                New Epoch Started
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
