import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  FaChartLine,
  FaUsers,
  FaGasPump,
  FaExchangeAlt,
  FaSpinner,
  FaCalendarAlt
} from 'react-icons/fa';

import { cn } from '../lib/utils';
import { fetchNetworkActivity, NetworkActivityData } from '../services/indexerApi';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardAction } from './ui/card';

export interface NetworkActivityChartsProps {
  className?: string;
  period?: '7d' | '30d' | '90d';
  onPeriodChange?: (period: '7d' | '30d' | '90d') => void;
}

/**
 * NetworkActivityCharts Component
 * Interactive charts showing network activity trends over time
 * Similar to Etherscan's analytics section
 */
const NetworkActivityCharts: React.FC<NetworkActivityChartsProps> = ({
  className,
  period = '30d',
  onPeriodChange
}) => {
  const [data, setData] = useState<NetworkActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'transactions' | 'accounts' | 'gas' | 'volume'>('transactions');

  const fetchNetworkActivityData = async () => {
    setLoading(true);
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const activityData = await fetchNetworkActivity(days);
      setData(activityData);
    } catch (error) {
      console.error('Failed to fetch network activity:', error);
      // Fallback to empty data on error
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkActivityData();
  }, [period]);

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatGasPrice = (price: number): string => {
    return `${price.toFixed(1)} Gwei`;
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`;
    return `$${volume.toLocaleString()}`;
  };

  const getChartConfig = () => {
    switch (activeChart) {
      case 'transactions':
        return {
          title: 'Daily Transactions',
          dataKey: 'transactions',
          color: '#AAFF00',
          icon: <FaExchangeAlt />,
          formatter: formatNumber
        };
      case 'accounts':
        return {
          title: 'Daily Active Accounts',
          dataKey: 'activeAccounts',
          color: '#00D4AA',
          icon: <FaUsers />,
          formatter: formatNumber
        };
      case 'gas':
        return {
          title: 'Average Gas Price',
          dataKey: 'gasPrice',
          color: '#FF6B6B',
          icon: <FaGasPump />,
          formatter: formatGasPrice
        };
      case 'volume':
        return {
          title: 'Daily Volume',
          dataKey: 'volume',
          color: '#0099FF',
          icon: <FaChartLine />,
          formatter: formatVolume
        };
      default:
        return {
          title: 'Daily Transactions',
          dataKey: 'transactions',
          color: '#AAFF00',
          icon: <FaExchangeAlt />,
          formatter: formatNumber
        };
    }
  };

  const chartConfig = getChartConfig();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="network-charts__tooltip">
          <p className="network-charts__tooltip-label">{label}</p>
          <p className="network-charts__tooltip-value">
            <span style={{ color: chartConfig.color }}>
              {chartConfig.title}: {chartConfig.formatter(value)}
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
        <div className="network-charts__loading">
          <FaSpinner className="network-charts__spinner" />
          <span>Loading chart data...</span>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={chartConfig.formatter}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={chartConfig.dataKey}
            stroke={chartConfig.color}
            strokeWidth={2}
            fill="url(#chartGradient)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className={cn('network-activity-charts', className)}>
      <div className="grid grid-cols-1 gap-6">
        {/* Chart Selection and Period Controls */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Network Activity</CardTitle>
              <CardDescription>Historical network statistics and trends</CardDescription>
              <CardAction>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="network-charts__calendar-icon" />
                  <Button
                    variant={period === '7d' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onPeriodChange?.('7d')}
                  >
                    7D
                  </Button>
                  <Button
                    variant={period === '30d' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onPeriodChange?.('30d')}
                  >
                    30D
                  </Button>
                  <Button
                    variant={period === '90d' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onPeriodChange?.('90d')}
                  >
                    90D
                  </Button>
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              {/* Chart Type Selector */}
              <div className="network-charts__selector">
                <Button
                  variant={activeChart === 'transactions' ? 'default' : 'ghost'}
                  size="sm"
                  className="inline-flex items-center gap-2"
                  onClick={() => setActiveChart('transactions')}
                >
                  Transactions
                </Button>
                <Button
                  variant={activeChart === 'accounts' ? 'default' : 'ghost'}
                  size="sm"
                  className="inline-flex items-center gap-2"
                  onClick={() => setActiveChart('accounts')}
                >
                  Active Accounts
                </Button>
                <Button
                  variant={activeChart === 'gas' ? 'default' : 'ghost'}
                  size="sm"
                  className="inline-flex items-center gap-2"
                  onClick={() => setActiveChart('gas')}
                >
                  Gas Price
                </Button>
                <Button
                  variant={activeChart === 'volume' ? 'default' : 'ghost'}
                  size="sm"
                  className="inline-flex items-center gap-2"
                  onClick={() => setActiveChart('volume')}
                >
                  Volume
                </Button>
              </div>

              {/* Chart Container */}
              <div className="network-charts__container">
                <div className="network-charts__header">
                  <div className="flex items-center gap-2">
                    {chartConfig.icon}
                    <h3 className="network-charts__title">{chartConfig.title}</h3>
                  </div>
                </div>
                {renderChart()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NetworkActivityCharts;
