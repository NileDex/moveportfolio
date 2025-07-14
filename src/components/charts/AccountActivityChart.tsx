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
  ResponsiveContainer
} from 'recharts';
import { FaUsers, FaSpinner } from 'react-icons/fa';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { client } from '../../services/indexerApi';
import { GET_ACCOUNT_ACTIVITY } from '../../services/indexerQueries';

export interface AccountActivityChartProps {
  className?: string;
}

interface AccountActivityData {
  date: string;
  activeAccounts: number;
  timestamp: number;
}

/**
 * AccountActivityChart Component
 * Shows daily active accounts over time using real Movement Network indexer data
 */
const AccountActivityChart: React.FC<AccountActivityChartProps> = ({
  className
}) => {
  const [data, setData] = useState<AccountActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchAccountActivity = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const response = await client.request(GET_ACCOUNT_ACTIVITY, {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

      const transactions = response.account_transactions || [];
      
      // Group by date and count unique accounts
      const dailyActivity: { [key: string]: Set<string> } = {};
      
      // Initialize daily data structure
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        dailyActivity[dateKey] = new Set();
      }

      // Process transactions to count unique active accounts per day
      transactions.forEach((tx: any) => {
        if (tx.inserted_at && tx.account_address) {
          const txDate = new Date(tx.inserted_at).toISOString().split('T')[0];
          if (dailyActivity[txDate]) {
            dailyActivity[txDate].add(tx.account_address);
          }
        }
      });

      // Convert to chart data format
      const chartData: AccountActivityData[] = [];
      Object.keys(dailyActivity).sort().forEach(dateKey => {
        const date = new Date(dateKey);
        chartData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          activeAccounts: dailyActivity[dateKey].size,
          timestamp: date.getTime()
        });
      });

      setData(chartData);
    } catch (error) {
      console.error('Failed to fetch account activity:', error);
      setError('Failed to load account activity data');
      
      // Fallback data
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const fallbackData: AccountActivityData[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        fallbackData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          activeAccounts: Math.floor(Math.random() * 500) + 200,
          timestamp: date.getTime()
        });
      }
      
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountActivity();
  }, [timeRange]);

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm text-primary">
            Active Accounts: <span className="font-mono font-semibold">{formatNumber(value)}</span>
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
            <span>Loading account activity...</span>
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
            <linearGradient id="accountsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
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
            tickFormatter={formatNumber}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="activeAccounts"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#accountsGradient)"
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
              <FaUsers className="text-primary" />
              Daily Active Accounts
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Unique accounts with transactions over the selected time period
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
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default AccountActivityChart;
