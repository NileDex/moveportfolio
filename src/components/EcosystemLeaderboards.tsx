import React, { useState, useEffect } from 'react';
import {
  FaTrophy,
  FaFire,
  FaCoins,
  FaStore,
  FaUsers,
  FaArrowUp,
  FaArrowDown,
  FaExternalLinkAlt,
  FaSpinner,
  FaSyncAlt
} from 'react-icons/fa';

import { cn } from '../lib/utils';
import MovementDataService from '../services/MovementDataService';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';

export interface LeaderboardItem {
  rank: number;
  name: string;
  address?: string;
  value: number;
  change24h?: number;
  volume24h?: number;
  tvl?: number;
  transactions?: number;
  logo?: string;
  verified?: boolean;
}

export interface EcosystemLeaderboardsProps {
  className?: string;
  refreshInterval?: number;
}

type LeaderboardType = 'dex' | 'nft' | 'accounts' | 'projects';

/**
 * EcosystemLeaderboards Component
 * Displays various ecosystem rankings and leaderboards
 * Similar to SuiScan's ecosystem showcases
 */
const EcosystemLeaderboards: React.FC<EcosystemLeaderboardsProps> = ({
  className,
  refreshInterval = 300000 // 5 minutes
}) => {
  const [activeBoard, setActiveBoard] = useState<LeaderboardType>('dex');
  const [data, setData] = useState<Record<LeaderboardType, LeaderboardItem[]>>({
    dex: [],
    nft: [],
    accounts: [],
    projects: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Generate mock leaderboard data
  const generateMockData = (): Record<LeaderboardType, LeaderboardItem[]> => {
    const dexPools: LeaderboardItem[] = [
      {
        rank: 1,
        name: 'MOVE/USDC',
        value: 2500000,
        change24h: 12.5,
        volume24h: 850000,
        tvl: 2500000,
        verified: true
      },
      {
        rank: 2,
        name: 'MOVE/ETH',
        value: 1800000,
        change24h: -3.2,
        volume24h: 620000,
        tvl: 1800000,
        verified: true
      },
      {
        rank: 3,
        name: 'USDC/USDT',
        value: 1200000,
        change24h: 0.8,
        volume24h: 450000,
        tvl: 1200000,
        verified: true
      },
      {
        rank: 4,
        name: 'MOVE/BTC',
        value: 950000,
        change24h: 8.7,
        volume24h: 320000,
        tvl: 950000,
        verified: true
      },
      {
        rank: 5,
        name: 'ETH/USDC',
        value: 780000,
        change24h: -1.5,
        volume24h: 280000,
        tvl: 780000,
        verified: true
      }
    ];

    const nftCollections: LeaderboardItem[] = [
      {
        rank: 1,
        name: 'Movement Punks',
        value: 125000,
        change24h: 25.3,
        volume24h: 125000,
        transactions: 45,
        verified: true
      },
      {
        rank: 2,
        name: 'Cosmic Cats',
        value: 89000,
        change24h: -8.2,
        volume24h: 89000,
        transactions: 32,
        verified: true
      },
      {
        rank: 3,
        name: 'Digital Dragons',
        value: 67000,
        change24h: 15.7,
        volume24h: 67000,
        transactions: 28,
        verified: false
      },
      {
        rank: 4,
        name: 'Pixel Warriors',
        value: 45000,
        change24h: 5.4,
        volume24h: 45000,
        transactions: 19,
        verified: true
      },
      {
        rank: 5,
        name: 'Mystic Orbs',
        value: 32000,
        change24h: -12.1,
        volume24h: 32000,
        transactions: 15,
        verified: false
      }
    ];

    const topAccounts: LeaderboardItem[] = [
      {
        rank: 1,
        name: 'Whale #1',
        address: '0x1234...5678',
        value: 15000000,
        transactions: 2847,
        verified: true
      },
      {
        rank: 2,
        name: 'DeFi Master',
        address: '0x2345...6789',
        value: 12500000,
        transactions: 1923,
        verified: true
      },
      {
        rank: 3,
        name: 'NFT Collector',
        address: '0x3456...7890',
        value: 8900000,
        transactions: 1456,
        verified: false
      },
      {
        rank: 4,
        name: 'Yield Farmer',
        address: '0x4567...8901',
        value: 7200000,
        transactions: 3421,
        verified: true
      },
      {
        rank: 5,
        name: 'Trader Pro',
        address: '0x5678...9012',
        value: 6100000,
        transactions: 5632,
        verified: false
      }
    ];

    const topProjects: LeaderboardItem[] = [
      {
        rank: 1,
        name: 'MovementSwap',
        value: 45000000,
        change24h: 18.5,
        volume24h: 2500000,
        transactions: 15420,
        verified: true
      },
      {
        rank: 2,
        name: 'MoveStake',
        value: 32000000,
        change24h: 12.3,
        volume24h: 1800000,
        transactions: 8930,
        verified: true
      },
      {
        rank: 3,
        name: 'MoveLend',
        value: 28000000,
        change24h: -5.7,
        volume24h: 1200000,
        transactions: 6540,
        verified: true
      },
      {
        rank: 4,
        name: 'MoveNFT',
        value: 15000000,
        change24h: 35.2,
        volume24h: 890000,
        transactions: 4320,
        verified: true
      },
      {
        rank: 5,
        name: 'MoveBridge',
        value: 12000000,
        change24h: 8.9,
        volume24h: 650000,
        transactions: 2180,
        verified: true
      }
    ];

    return {
      dex: dexPools,
      nft: nftCollections,
      accounts: topAccounts,
      projects: topProjects
    };
  };

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = generateMockData();
      setData(mockData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchLeaderboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const formatValue = (value: number, type: 'currency' | 'number' = 'currency'): string => {
    if (type === 'number') {
      return value.toLocaleString();
    }
    
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const truncateAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getLeaderboardConfig = () => {
    switch (activeBoard) {
      case 'dex':
        return {
          title: 'Top DEX Pools',
          subtitle: 'Ranked by Total Value Locked (TVL)',
          icon: <FaCoins />,
          valueLabel: 'TVL',
          secondaryLabel: '24h Volume'
        };
      case 'nft':
        return {
          title: 'Trending NFT Collections',
          subtitle: 'Ranked by 24h trading volume',
          icon: <FaFire />,
          valueLabel: '24h Volume',
          secondaryLabel: 'Transactions'
        };
      case 'accounts':
        return {
          title: 'Top Account Holders',
          subtitle: 'Ranked by total balance',
          icon: <FaUsers />,
          valueLabel: 'Balance',
          secondaryLabel: 'Transactions'
        };
      case 'projects':
        return {
          title: 'Top Projects',
          subtitle: 'Ranked by total value locked',
          icon: <FaStore />,
          valueLabel: 'TVL',
          secondaryLabel: '24h Volume'
        };
      default:
        return {
          title: 'Top DEX Pools',
          subtitle: 'Ranked by Total Value Locked (TVL)',
          icon: <FaCoins />,
          valueLabel: 'TVL',
          secondaryLabel: '24h Volume'
        };
    }
  };

  const config = getLeaderboardConfig();
  const currentData = data[activeBoard] || [];

  const renderLeaderboardItem = (item: LeaderboardItem, index: number) => {
    return (
      <div key={index} className="leaderboard__item">
        <div className="leaderboard__item-left">
          <div className="leaderboard__rank">
            {item.rank <= 3 ? (
              <FaTrophy className={cn('leaderboard__trophy', {
                'leaderboard__trophy--gold': item.rank === 1,
                'leaderboard__trophy--silver': item.rank === 2,
                'leaderboard__trophy--bronze': item.rank === 3
              })} />
            ) : (
              <span className="leaderboard__rank-number">#{item.rank}</span>
            )}
          </div>
          
          <div className="leaderboard__item-info">
            <div className="leaderboard__item-name">
              {item.name}
              {item.verified && (
                <span className="leaderboard__verified">✓</span>
              )}
            </div>
            {item.address && (
              <div className="leaderboard__item-address">
                {truncateAddress(item.address)}
              </div>
            )}
          </div>
        </div>
        
        <div className="leaderboard__item-right">
          <div className="leaderboard__item-values">
            <div className="leaderboard__item-primary">
              {formatValue(item.value)}
            </div>
            
            <div className="leaderboard__item-secondary">
              {activeBoard === 'dex' && item.volume24h && (
                <span>Vol: {formatValue(item.volume24h)}</span>
              )}
              {activeBoard === 'nft' && item.transactions && (
                <span>{item.transactions} txns</span>
              )}
              {activeBoard === 'accounts' && item.transactions && (
                <span>{formatValue(item.transactions, 'number')} txns</span>
              )}
              {activeBoard === 'projects' && item.volume24h && (
                <span>Vol: {formatValue(item.volume24h)}</span>
              )}
            </div>
          </div>
          
          {item.change24h !== undefined && (
            <div className={cn('leaderboard__change', {
              'leaderboard__change--positive': item.change24h >= 0,
              'leaderboard__change--negative': item.change24h < 0
            })}>
              {item.change24h >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {formatChange(item.change24h)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('ecosystem-leaderboards', className)}>
      <Card>
        <CardHeader
          title="Ecosystem Leaderboards"
          subtitle={lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : undefined}
          actions={
            <Button
              variant="ghost"
              size="sm"
              className="inline-flex items-center gap-2"
              onClick={fetchLeaderboardData}
              disabled={loading}
            >
              Refresh
            </Button>
          }
        />
        
        <CardContent>
          {/* Leaderboard Type Selector */}
          <div className="leaderboard__selector">
            <Button
              variant={activeBoard === 'dex' ? 'primary' : 'ghost'}
              size="sm"
              className="inline-flex items-center gap-2"
              onClick={() => setActiveBoard('dex')}
            >
              DEX Pools
            </Button>
            <Button
              variant={activeBoard === 'nft' ? 'primary' : 'ghost'}
              size="sm"
              className="inline-flex items-center gap-2"
              onClick={() => setActiveBoard('nft')}
            >
              NFT Collections
            </Button>
            <Button
              variant={activeBoard === 'accounts' ? 'primary' : 'ghost'}
              size="sm"
              className="inline-flex items-center gap-2"
              onClick={() => setActiveBoard('accounts')}
            >
              Top Accounts
            </Button>
            <Button
              variant={activeBoard === 'projects' ? 'primary' : 'ghost'}
              size="sm"
              className="inline-flex items-center gap-2"
              onClick={() => setActiveBoard('projects')}
            >
              Projects
            </Button>
          </div>

          {/* Leaderboard Content */}
          <div className="leaderboard__content">
            <div className="leaderboard__header">
              <div className="flex items-center gap-2">
                {config.icon}
                <div>
                  <h3 className="leaderboard__title">{config.title}</h3>
                  <p className="leaderboard__subtitle">{config.subtitle}</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="leaderboard__loading">
                <FaSpinner className="leaderboard__spinner" />
                <span>Loading leaderboard...</span>
              </div>
            ) : (
              <div className="leaderboard__list">
                {currentData.map((item, index) => renderLeaderboardItem(item, index))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EcosystemLeaderboards;
export type { LeaderboardItem, EcosystemLeaderboardsProps };
