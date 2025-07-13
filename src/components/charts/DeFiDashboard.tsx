import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AreaChart as AreaChartIcon, BarChart3 } from 'lucide-react';
import { client } from '@/services/indexerApi';
import { gql } from 'graphql-request';
import { useAnimation, useConditionalAnimation } from '@/contexts/AnimationContext';
import {
  fadeIn,
  slideUp,
  staggerFadeIn,
  scaleIn,
  hoverScale,
  setWillChange,
  clearWillChange,
  DURATION,
  EASING
} from '@/lib/animations';

// Types
interface DeFiProtocol {
  name: string;
  volume24h: number;
  totalTxs24h: number;
  change24h: number;
  color: string;
}

interface DeFiChartData {
  date: string;
  [key: string]: string | number;
}

type ChartType = 'area' | 'bar';
type TimeRange = '7D' | '30D';

// Mock DeFi protocols data (since Movement Network is new, we'll simulate realistic DeFi data)
const mockProtocols: DeFiProtocol[] = [
  {
    name: 'MovementSwap',
    volume24h: 2450000,
    totalTxs24h: 15420,
    change24h: 12.5,
    color: '#BDAB4C'
  },
  {
    name: 'MoveStake',
    volume24h: 1850000,
    totalTxs24h: 8930,
    change24h: -5.2,
    color: '#DAD6C5'
  },
  {
    name: 'MoveLend',
    volume24h: 980000,
    totalTxs24h: 4560,
    change24h: 8.7,
    color: '#55462F'
  },
  {
    name: 'MoveYield',
    volume24h: 720000,
    totalTxs24h: 2890,
    change24h: -2.1,
    color: '#8B7355'
  },
  {
    name: 'MoveBridge',
    volume24h: 450000,
    totalTxs24h: 1240,
    change24h: 15.3,
    color: '#A0916B'
  }
];

// Generate mock chart data
const generateChartData = (days: number): DeFiChartData[] => {
  const data: DeFiChartData[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    // Different approach: Create date from year, month, day components
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);

    const entry: DeFiChartData = {
      date: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    
    // Add data for each protocol with some realistic variation
    mockProtocols.forEach(protocol => {
      const baseValue = protocol.volume24h / 1000; // Convert to thousands
      const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
      entry[protocol.name] = Math.round(baseValue * (1 + variation));
    });
    
    data.push(entry);
  }
  
  return data;
};

const DeFiDashboard: React.FC = () => {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeRange, setTimeRange] = useState<TimeRange>('7D');
  const [chartData, setChartData] = useState<DeFiChartData[]>([]);
  const [loading, setLoading] = useState(true);

  // Animation refs and hooks
  const cardRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const { shouldAnimate, shouldUseStagger, shouldUseWillChange } = useConditionalAnimation();

  // Initial component animation
  useEffect(() => {
    if (shouldAnimate && cardRef.current) {
      // Animate card entrance
      fadeIn(cardRef.current, {
        duration: DURATION.SLOW,
        ease: EASING.EASE_OUT,
      });

      // Set will-change for performance
      if (shouldUseWillChange) {
        setWillChange(cardRef.current, 'opacity, transform');
      }
    }

    return () => {
      if (shouldUseWillChange && cardRef.current) {
        clearWillChange(cardRef.current);
      }
    };
  }, [shouldAnimate, shouldUseWillChange]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Animate chart exit if changing data
      if (shouldAnimate && chartRef.current && chartData.length > 0) {
        await new Promise(resolve => {
          slideUp(chartRef.current!, {
            duration: DURATION.FAST,
            ease: EASING.EASE_IN,
            onComplete: resolve as () => void,
          });
        });
      }

      try {
        // Generate mock data based on time range
        const days = timeRange === '7D' ? 7 : 30;
        const data = generateChartData(days);
        setChartData(data);
      } catch (error) {
        console.error('Error loading DeFi data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange, shouldAnimate]);

  // Animate chart and table when data loads
  useEffect(() => {
    if (!loading && chartData.length > 0 && shouldAnimate) {
      // Animate chart entrance
      if (chartRef.current) {
        slideUp(chartRef.current, {
          duration: DURATION.NORMAL,
          delay: 0.1,
          ease: EASING.BOUNCE_OUT,
        });
      }

      // Animate table rows with stagger
      if (tableRef.current && shouldUseStagger) {
        const rows = tableRef.current.querySelectorAll('tbody tr');
        staggerFadeIn(Array.from(rows), {
          duration: DURATION.NORMAL,
          delay: 0.3,
          stagger: 0.05,
          ease: EASING.EASE_OUT,
        });
      }
    }
  }, [loading, chartData, shouldAnimate, shouldUseStagger]);

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  // Animated button handlers
  const handleChartTypeChange = (newType: ChartType) => {
    if (shouldAnimate && buttonsRef.current) {
      const button = buttonsRef.current.querySelector(`[data-chart-type="${newType}"]`);
      if (button) {
        scaleIn(button, {
          duration: DURATION.FAST,
          ease: EASING.BOUNCE_OUT,
        });
      }
    }
    setChartType(newType);
  };

  const handleTimeRangeChange = (newRange: TimeRange) => {
    if (shouldAnimate && buttonsRef.current) {
      const button = buttonsRef.current.querySelector(`[data-time-range="${newRange}"]`);
      if (button) {
        scaleIn(button, {
          duration: DURATION.FAST,
          ease: EASING.BOUNCE_OUT,
        });
      }
    }
    setTimeRange(newRange);
  };

  // Setup hover effects for interactive elements
  useEffect(() => {
    if (shouldAnimate && buttonsRef.current) {
      const buttons = buttonsRef.current.querySelectorAll('button');
      buttons.forEach(button => {
        hoverScale(button, 1.05);
      });
    }
  }, [shouldAnimate]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {formatValue(entry.value * 1000)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card ref={cardRef} className="bg-gray-900 border-gray-800 h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white">DeFi Dashboard</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-primary text-primary bg-transparent hover:bg-primary/20 hover:text-primary hover:border-primary/80 px-4 py-2 font-medium transition-colors duration-200"
            >
              Visit Dashboard
            </Button>
          </div>
        </div>

        <div ref={buttonsRef} className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1 bg-background/20 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              data-chart-type="area"
              onClick={() => handleChartTypeChange('area')}
              className={`p-2 font-medium transition-colors ${chartType === 'area'
                ? '!bg-[hsl(var(--primary))] !text-[hsl(var(--primary-foreground))] hover:!bg-[hsl(var(--primary))]/90'
                : 'text-muted-foreground hover:!bg-[hsl(var(--primary))]/20 hover:!text-[hsl(var(--primary))]'
              }`}
            >
              <AreaChartIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              data-chart-type="bar"
              onClick={() => handleChartTypeChange('bar')}
              className={`p-2 font-medium transition-colors ${chartType === 'bar'
                ? '!bg-[hsl(var(--primary))] !text-[hsl(var(--primary-foreground))] hover:!bg-[hsl(var(--primary))]/90'
                : 'text-muted-foreground hover:!bg-[hsl(var(--primary))]/20 hover:!text-[hsl(var(--primary))]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 bg-background/20 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              data-time-range="7D"
              onClick={() => handleTimeRangeChange('7D')}
              className={`uppercase font-medium px-4 transition-colors ${timeRange === '7D'
                ? '!bg-[hsl(var(--primary))] !text-[hsl(var(--primary-foreground))] hover:!bg-[hsl(var(--primary))]/90'
                : 'text-muted-foreground hover:!bg-[hsl(var(--primary))]/20 hover:!text-[hsl(var(--primary))]'
              }`}
            >
              7D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              data-time-range="30D"
              onClick={() => handleTimeRangeChange('30D')}
              className={`uppercase font-medium px-4 transition-colors ${timeRange === '30D'
                ? '!bg-[hsl(var(--primary))] !text-[hsl(var(--primary-foreground))] hover:!bg-[hsl(var(--primary))]/90'
                : 'text-muted-foreground hover:!bg-[hsl(var(--primary))]/20 hover:!text-[hsl(var(--primary))]'
              }`}
            >
              30D
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-400">Loading DeFi data...</div>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div ref={chartRef} className="flex-1 min-h-[200px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      scale="point"
                      axisLine={false}
                      tickLine={false}
                      interval={2} // force showing all ticks (can change based on density)
                      minTickGap={25} // prevent overlap
                      padding={{ left: 0, right: 10 }}
                      // interval="preserveStartEnd"
                      // minTickGap={25}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => value === 0 ? '0' : `${value}K`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {mockProtocols.map((protocol) => (
                      <Area
                        key={protocol.name}
                        type="monotone"
                        dataKey={protocol.name}
                        stackId="1"
                        stroke={protocol.color}
                        fill={protocol.color}
                        fillOpacity={0.8}
                      />
                    ))}
                  </AreaChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      interval={2} // force showing all ticks (can change based on density)
                      minTickGap={20} // prevent overlap
                      padding={{ left: 0, right: 0 }}

                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => value === 0 ? '0' : `${value}K`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {mockProtocols.map((protocol) => (
                      <Bar
                        key={protocol.name}
                        dataKey={protocol.name}
                        stackId="1"
                        fill={protocol.color}
                      />
                    ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Top DeFi Protocols Table */}
            <div className="flex-shrink-0">
              <h3 className="text-lg font-semibold text-white mb-3">Top DeFi Protocols by Volume</h3>
              <div className="max-h-[200px] overflow-y-auto">
                <table ref={tableRef} className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-900">
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-1 text-gray-400 font-medium">Protocol</th>
                      <th className="text-right py-2 px-1 text-gray-400 font-medium">Volume 24H</th>
                      <th className="text-right py-2 px-1 text-gray-400 font-medium">Txs 24H</th>
                      <th className="text-right py-2 px-1 text-gray-400 font-medium">24H Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockProtocols.map((protocol) => (
                      <tr key={protocol.name} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-2 px-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: protocol.color }}
                            />
                            <span className="text-white font-medium">{protocol.name}</span>
                          </div>
                        </td>
                        <td className="text-right py-2 px-1 text-white font-mono">
                          {formatValue(protocol.volume24h)}
                        </td>
                        <td className="text-right py-2 px-1 text-white font-mono">
                          {protocol.totalTxs24h.toLocaleString()}
                        </td>
                        <td className={`text-right py-2 px-1 font-mono ${protocol.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {protocol.change24h >= 0 ? '+' : ''}{protocol.change24h.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DeFiDashboard;
