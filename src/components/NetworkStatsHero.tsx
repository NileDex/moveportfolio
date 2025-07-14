import React, { useState, useEffect } from 'react';
import {
  FaArrowUp,
  FaArrowDown,
  FaUsers,
  FaExchangeAlt,
  FaGasPump,
  FaServer,
  FaCoins,
  FaChartLine
} from 'react-icons/fa';
import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';
import MovementDataService from '../services/MovementDataService';

export interface NetworkStat {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  prefix?: string;
  suffix?: string;
}

export interface NetworkStatsHeroProps {
  className?: string;
  showChangeIndicators?: boolean;
  refreshInterval?: number;
  onRefresh?: () => void;
}

/**
 * NetworkStatsHero Component
 * Displays real-time network statistics in a prominent hero section
 * Similar to Etherscan's network overview section
 */
const NetworkStatsHero: React.FC<NetworkStatsHeroProps> = ({
  className,
  showChangeIndicators = true,
  refreshInterval = 30000, // 30 seconds
  onRefresh
}) => {
  const [stats, setStats] = useState<NetworkStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch real network statistics from APIs
  const fetchNetworkStats = async (): Promise<NetworkStat[]> => {
    try {
      // Get real price data from MovementDataService
      const priceData = await MovementDataService.getMovePrice();

      // Fetch network data from Movement GraphQL
      const networkQuery = `
        query GetNetworkStats {
          processor_status {
            last_success_version
          }
          ledger_infos(limit: 1, order_by: {chain_id: desc}) {
            chain_id
          }
        }
      `;

      const graphqlEndpoint = import.meta.env.DEV
        ? '/api/graphql'
        : 'https://indexer.mainnet.movementnetwork.xyz/v1/graphql';

      const networkResponse = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: networkQuery
        })
      });

      const networkData = await networkResponse.json();

      // Extract data with fallbacks
      const movePrice = priceData.price || 0;
      const priceChange = priceData.change24h || 0;
      const marketCap = priceData.marketCap || 0;
      const lastVersion = networkData.data?.processor_status?.[0]?.last_success_version || 0;

      // Format numbers
      const formatNumber = (num: number): string => {
        if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toLocaleString();
      };

      return [
        {
          label: 'MOVE Price',
          value: movePrice.toFixed(4),
          change: Math.abs(priceChange),
          changeType: priceChange >= 0 ? 'positive' : 'negative',
          icon: FaCoins,
          prefix: '$'
        },
        {
          label: 'Market Cap',
          value: formatNumber(marketCap),
          icon: FaChartLine,
          prefix: '$'
        },
        {
          label: 'Total Transactions',
          value: formatNumber(lastVersion),
          icon: FaExchangeAlt
        },
        {
          label: 'Network',
          value: 'Mainnet',
          icon: FaServer
        }
      ];
    } catch (error) {
      console.error('Failed to fetch network stats:', error);
      // Return minimal fallback data
      return [
        {
          label: 'MOVE Price',
          value: 'Loading...',
          icon: FaCoins,
          loading: true
        },
        {
          label: 'Market Cap',
          value: 'Loading...',
          icon: FaChartLine,
          loading: true
        },
        {
          label: 'Total Transactions',
          value: 'Loading...',
          icon: FaExchangeAlt,
          loading: true
        },
        {
          label: 'Network',
          value: 'Mainnet',
          icon: FaServer
        }
      ];
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const newStats = await fetchNetworkStats();
      setStats(newStats);
      setLastUpdated(new Date());
      onRefresh?.();
    } catch (error) {
      console.error('Failed to fetch network stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    if (refreshInterval > 0) {
      const interval = setInterval(loadStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const formatValue = (stat: NetworkStat): string => {
    const { value, prefix = '', suffix = '' } = stat;
    return `${prefix}${value}${suffix}`;
  };

  const renderChangeIndicator = (stat: NetworkStat) => {
    if (!showChangeIndicators || !stat.change) return null;

    const isPositive = stat.changeType === 'positive';
    const isNegative = stat.changeType === 'negative';
    
    return (
      <div className={cn(
        'network-stats-hero__change',
        {
          'network-stats-hero__change--positive': isPositive,
          'network-stats-hero__change--negative': isNegative,
          'network-stats-hero__change--neutral': !isPositive && !isNegative
        }
      )}>
        {isPositive && <FaArrowUp className="network-stats-hero__change-icon" />}
        {isNegative && <FaArrowDown className="network-stats-hero__change-icon" />}
        <span>{Math.abs(stat.change)}%</span>
      </div>
    );
  };

  const renderStatCard = (stat: NetworkStat, index: number) => {
    const IconComponent = stat.icon;
    
    return (
      <Card 
        key={`${stat.label}-${index}`}
        className="network-stats-hero__card"
        variant="outlined"
      >
        <CardContent className="network-stats-hero__card-body">
          <div className="flex gap-2">
            {/* Header with icon and label */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {IconComponent && (
                  <IconComponent className="network-stats-hero__icon" />
                )}
                <span className="network-stats-hero__label">
                  {stat.label}
                </span>
              </div>
              {renderChangeIndicator(stat)}
            </div>
            
            {/* Value */}
            <div className="network-stats-hero__value">
              {loading || stat.loading ? (
                <div className="network-stats-hero__skeleton" />
              ) : (
                formatValue(stat)
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn('network-stats-hero', className)}>
      <div className="network-stats-hero__container">
        {/* Header */}
        <div className="network-stats-hero__header">
          <h2 className="network-stats-hero__title">Movement Network Overview</h2>
          {lastUpdated && (
            <span className="network-stats-hero__updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4">
          {stats.map((stat, index) => (
            <div className="grid gap-4">
              {renderStatCard(stat, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkStatsHero;
