import React, { useState, useEffect } from 'react';
import {
  FaServer,
  FaUsers,
  FaCoins,
  FaChartLine,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
  FaSpinner,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import MovementDataService from '../services/MovementDataService';

export interface ValidatorInfo {
  address: string;
  name: string;
  stakedAmount: number;
  delegators: number;
  commission: number;
  apy: number;
  uptime: number;
  status: 'active' | 'inactive' | 'jailed';
  votingPower: number;
  rank: number;
}

type SortField = 'stakedAmount' | 'delegators' | 'commission' | 'apy' | 'uptime' | 'votingPower';
type SortDirection = 'asc' | 'desc';

/**
 * ValidatorsPage Component
 * Comprehensive validator dashboard with staking information
 * Enhanced with real validator data and sorting capabilities
 */
const ValidatorsPage: React.FC = () => {
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('stakedAmount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Generate mock validator data
  const generateValidatorData = (): ValidatorInfo[] => {
    const validatorNames = [
      'Movement Foundation',
      'Staking Rewards',
      'Validator One',
      'Secure Stake',
      'Movement Labs',
      'Crypto Capital',
      'Stake Fish',
      'Figment',
      'Chorus One',
      'P2P Validator',
      'Everstake',
      'Coinbase Cloud',
      'Kraken',
      'Binance Staking',
      'Huobi Pool'
    ];

    return validatorNames.map((name, index) => {
      const baseStake = 5000000 - (index * 200000);
      const randomFactor = 0.8 + Math.random() * 0.4;

      return {
        address: `0x${Math.random().toString(16).substring(2, 42)}`,
        name,
        stakedAmount: Math.floor(baseStake * randomFactor),
        delegators: Math.floor((500 - index * 20) * (0.7 + Math.random() * 0.6)),
        commission: Math.floor((2 + Math.random() * 8) * 100) / 100,
        apy: Math.floor((8 + Math.random() * 4) * 100) / 100,
        uptime: Math.floor((95 + Math.random() * 5) * 100) / 100,
        status: Math.random() > 0.1 ? 'active' : (Math.random() > 0.5 ? 'inactive' : 'jailed'),
        votingPower: Math.floor((baseStake * randomFactor / 50000000) * 10000) / 100,
        rank: index + 1
      };
    });
  };

  const fetchValidators = async () => {
    setLoading(true);
    try {
      const validatorData = await MovementDataService.getValidators();
      setValidators(validatorData);
    } catch (error) {
      console.error('Failed to fetch validators:', error);
      // Fallback to empty array on error
      setValidators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidators();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="validators__sort-icon" />;
    return sortDirection === 'asc'
      ? <FaSortUp className="validators__sort-icon validators__sort-icon--active" />
      : <FaSortDown className="validators__sort-icon validators__sort-icon--active" />;
  };

  const filteredAndSortedValidators = validators
    .filter(validator =>
      validator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      validator.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const multiplier = sortDirection === 'asc' ? 1 : -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * multiplier;
      }

      return String(aValue).localeCompare(String(bValue)) * multiplier;
    });

  const formatStakeAmount = (amount: number): string => {
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M MOVE`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}K MOVE`;
    return `${amount.toLocaleString()} MOVE`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const getStatusIcon = (status: ValidatorInfo['status']) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="validators__status-icon validators__status-icon--active" />;
      case 'inactive':
        return <FaExclamationTriangle className="validators__status-icon validators__status-icon--inactive" />;
      case 'jailed':
        return <FaShieldAlt className="validators__status-icon validators__status-icon--jailed" />;
      default:
        return null;
    }
  };

  const truncateAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Calculate network totals
  const totalStaked = validators.reduce((sum, v) => sum + v.stakedAmount, 0);
  const totalDelegators = validators.reduce((sum, v) => sum + v.delegators, 0);
  const activeValidators = validators.filter(v => v.status === 'active').length;
  const averageAPY = validators.reduce((sum, v) => sum + v.apy, 0) / validators.length;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-3">
      <div className="space-y-6">
        {/* Network Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaServer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Active Validators</span>
                  </div>
                  <span className="text-lg font-semibold">{activeValidators}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaCoins className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Staked</span>
                  </div>
                  <span className="text-lg font-semibold">{formatStakeAmount(totalStaked)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaUsers className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Delegators</span>
                  </div>
                  <span className="text-lg font-semibold">{totalDelegators.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaChartLine className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Average APY</span>
                  </div>
                  <span className="text-lg font-semibold">{formatPercentage(averageAPY)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Validators Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3>Validators</h3>
              <div className="flex items-center gap-2 ml-auto">
                <FaSearch className="validators__search-icon" />
                <input
                  type="text"
                  placeholder="Search validators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="validators__search-input"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="validators__table-container">
            {loading ? (
              <div className="validators__loading">
                <FaSpinner className="validators__spinner" />
                <span>Loading validators...</span>
              </div>
            ) : (
              <div className="validators__table-wrapper">
                <table className="validators__table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Validator</th>
                      <th>Status</th>
                      <th
                        className="validators__sortable"
                        onClick={() => handleSort('stakedAmount')}
                      >
                        Staked Amount {getSortIcon('stakedAmount')}
                      </th>
                      <th
                        className="validators__sortable"
                        onClick={() => handleSort('delegators')}
                      >
                        Delegators {getSortIcon('delegators')}
                      </th>
                      <th
                        className="validators__sortable"
                        onClick={() => handleSort('commission')}
                      >
                        Commission {getSortIcon('commission')}
                      </th>
                      <th
                        className="validators__sortable"
                        onClick={() => handleSort('apy')}
                      >
                        APY {getSortIcon('apy')}
                      </th>
                      <th
                        className="validators__sortable"
                        onClick={() => handleSort('uptime')}
                      >
                        Uptime {getSortIcon('uptime')}
                      </th>
                      <th
                        className="validators__sortable"
                        onClick={() => handleSort('votingPower')}
                      >
                        Voting Power {getSortIcon('votingPower')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedValidators.map((validator) => (
                      <tr key={validator.address} className="validators__row">
                        <td className="validators__rank">#{validator.rank}</td>
                        <td className="validators__validator">
                          <div className="validators__validator-info">
                            <div className="validators__validator-name">{validator.name}</div>
                            <div className="validators__validator-address">
                              {truncateAddress(validator.address)}
                            </div>
                          </div>
                        </td>
                        <td className="validators__status">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(validator.status)}
                            <span className={cn('validators__status-text', {
                              'validators__status-text--active': validator.status === 'active',
                              'validators__status-text--inactive': validator.status === 'inactive',
                              'validators__status-text--jailed': validator.status === 'jailed'
                            })}>
                              {validator.status}
                            </span>
                          </div>
                        </td>
                        <td className="validators__amount">{formatStakeAmount(validator.stakedAmount)}</td>
                        <td className="validators__delegators">{validator.delegators.toLocaleString()}</td>
                        <td className="validators__commission">{formatPercentage(validator.commission)}</td>
                        <td className="validators__apy">{formatPercentage(validator.apy)}</td>
                        <td className="validators__uptime">{formatPercentage(validator.uptime)}</td>
                        <td className="validators__voting-power">{formatPercentage(validator.votingPower)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ValidatorsPage;
