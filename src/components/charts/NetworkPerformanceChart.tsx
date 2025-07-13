import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar
} from 'recharts';
import { FaChartLine, FaSpinner, FaTachometerAlt } from 'react-icons/fa';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { client } from '../../services/indexerApi';
import { GET_TRANSACTION_VOLUME, GET_BLOCK_DATA } from '../../services/indexerQueries';

export interface NetworkPerformanceChartProps {
  className?: string;
}

interface NetworkPerformanceData {
  date: string;
  transactions: number;
  tps: number;
  blockTime: number;
  timestamp: number;
}

/**
 * NetworkPerformanceChart Component
 * Shows TPS, transaction volume, and block performance metrics
 */
const NetworkPerformanceChart: React.FC<NetworkPerformanceChartProps> = ({
  className
}) => {
  const [data, setData] = useState<NetworkPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<'transactions' | 'tps' | 'blockTime'>('transactions');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchNetworkPerformance = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch transaction volume and block data
      const [transactionResponse, blockResponse] = await Promise.all([
        client.request(GET_TRANSACTION_VOLUME, {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        }),
        client.request(GET_BLOCK_DATA, {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        })
      ]);

      const transactions = transactionResponse.user_transactions_aggregate?.nodes || [];
      const blocks = blockResponse.block_metadata_transactions || [];
      
      // Group data by date
      const dailyData: { [key: string]: {
        transactions: number;
        blocks: number;
        totalBlockTime: number;
        timestamps: number[];
      } } = {};
      
      // Initialize daily data structure
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        dailyData[dateKey] = {
          transactions: 0,
          blocks: 0,
          totalBlockTime: 0,
          timestamps: []
        };
      }

      // Process transaction data
      transactions.forEach((tx: any) => {
        if (tx.timestamp) {
          const txDate = new Date(tx.timestamp).toISOString().split('T')[0];
          if (dailyData[txDate]) {
            dailyData[txDate].transactions++;
          }
        }
      });

      // Process block data and calculate block times
      blocks.forEach((block: any, index: number) => {
        if (block.timestamp) {
          const blockDate = new Date(block.timestamp).toISOString().split('T')[0];
          if (dailyData[blockDate]) {
            dailyData[blockDate].blocks++;
            dailyData[blockDate].timestamps.push(new Date(block.timestamp).getTime());
          }
        }
      });

      // Convert to chart data format
      const chartData: NetworkPerformanceData[] = [];
      Object.keys(dailyData).sort().forEach(dateKey => {
        const dayData = dailyData[dateKey];
        const date = new Date(dateKey);
        
        // Calculate average block time
        let avgBlockTime = 0;
        if (dayData.timestamps.length > 1) {
          const sortedTimestamps = dayData.timestamps.sort((a, b) => a - b);
          let totalTimeDiff = 0;
          for (let i = 1; i < sortedTimestamps.length; i++) {
            totalTimeDiff += sortedTimestamps[i] - sortedTimestamps[i - 1];
          }
          avgBlockTime = totalTimeDiff / (sortedTimestamps.length - 1) / 1000; // Convert to seconds
        }
        
        // Calculate TPS (transactions per second)
        const tps = dayData.transactions / (24 * 60 * 60); // Transactions per day / seconds per day
        
        chartData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          transactions: dayData.transactions,
          tps: Math.round(tps * 100) / 100, // Round to 2 decimal places
          blockTime: Math.round(avgBlockTime * 100) / 100, // Round to 2 decimal places
          timestamp: date.getTime()
        });
      });

      setData(chartData);
    } catch (error) {
      console.error('Failed to fetch network performance:', error);
      setError('Failed to load network performance data');
      
      // Fallback data
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const fallbackData: NetworkPerformanceData[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        fallbackData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          transactions: Math.floor(Math.random() * 5000) + 1000,
          tps: Math.round((Math.random() * 50 + 10) * 100) / 100,
          blockTime: Math.round((Math.random() * 3 + 1) * 100) / 100,
          timestamp: date.getTime()
        });
      }
      
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkPerformance();
  }, [timeRange]);

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getMetricConfig = () => {
    switch (activeMetric) {
      case 'transactions':
        return {
          title: 'Daily Transactions',
          dataKey: 'transactions',
          color: 'hsl(var(--primary))',
          formatter: formatNumber,
          unit: ''
        };
      case 'tps':
        return {
          title: 'Average TPS',
          dataKey: 'tps',
          color: 'hsl(var(--chart-2))',
          formatter: (val: number) => val.toFixed(2),
          unit: ' TPS'
        };
      case 'blockTime':
        return {
          title: 'Average Block Time',
          dataKey: 'blockTime',
          color: 'hsl(var(--chart-3))',
          formatter: (val: number) => val.toFixed(2),
          unit: 's'
        };
      default:
        return {
          title: 'Daily Transactions',
          dataKey: 'transactions',
          color: 'hsl(var(--primary))',
          formatter: formatNumber,
          unit: ''
        };
    }
  };

  const metricConfig = getMetricConfig();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm" style={{ color: metricConfig.color }}>
            {metricConfig.title}: <span className="font-mono font-semibold">
              {metricConfig.formatter(value)}{metricConfig.unit}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FaSpinner className="animate-spin" />
            <span>Loading network performance...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-1">Showing sample data</p>
          </div>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={metricConfig.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={metricConfig.color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={metricConfig.formatter}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={metricConfig.dataKey}
            stroke={metricConfig.color}
            strokeWidth={2}
            fill="url(#performanceGradient)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <FaTachometerAlt className="text-primary" />
              Network Performance
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Transaction throughput and network performance metrics
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 bg-background/20 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeRange('7d')}
              className={`uppercase font-medium px-3 transition-colors ${
                timeRange === '7d'
                  ? '!bg-[hsl(var(--primary))] !text-[hsl(var(--primary-foreground))] hover:!bg-[hsl(var(--primary))]/90'
                  : 'text-muted-foreground hover:!bg-[hsl(var(--primary))]/20 hover:!text-[hsl(var(--primary))]'
              }`}
            >
              7D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeRange('30d')}
              className={`uppercase font-medium px-3 transition-colors ${
                timeRange === '30d'
                  ? '!bg-[hsl(var(--primary))] !text-[hsl(var(--primary-foreground))] hover:!bg-[hsl(var(--primary))]/90'
                  : 'text-muted-foreground hover:!bg-[hsl(var(--primary))]/20 hover:!text-[hsl(var(--primary))]'
              }`}
            >
              30D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeRange('90d')}
              className={`uppercase font-medium px-3 transition-colors ${
                timeRange === '90d'
                  ? '!bg-[hsl(var(--primary))] !text-[hsl(var(--primary-foreground))] hover:!bg-[hsl(var(--primary))]/90'
                  : 'text-muted-foreground hover:!bg-[hsl(var(--primary))]/20 hover:!text-[hsl(var(--primary))]'
              }`}
            >
              90D
            </Button>
          </div>
        </div>
        <div className="flex gap-1 mt-2 bg-background/20 rounded-lg p-1">
          <Button
            variant={activeMetric === 'transactions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveMetric('transactions')}
            className="font-medium px-3 py-1.5"
          >
            Transactions
          </Button>
          <Button
            variant={activeMetric === 'tps' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveMetric('tps')}
            className="font-medium px-3 py-1.5"
          >
            TPS
          </Button>
          <Button
            variant={activeMetric === 'blockTime' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveMetric('blockTime')}
            className="font-medium px-3 py-1.5"
          >
            Block Time
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default NetworkPerformanceChart;
