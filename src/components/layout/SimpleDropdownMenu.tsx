import React, { useState, useRef, useEffect } from 'react';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { cn } from '../../lib/utils';
import { FaChevronDown } from 'react-icons/fa';
import {
  RiDashboardHorizontalFill,
  RiExchangeLine,
  RiImageLine,
  RiBarChartLine
} from 'react-icons/ri';
import {
  FaHistory,
  FaStar,
  FaCube,
  FaServer,
  FaCoins,
  FaCode,
  FaSearch,
  FaTools,
  FaCrown,
  FaWallet,
  FaChartLine,
  FaBook,
  FaQuestionCircle,
  FaEllipsisH
} from 'react-icons/fa';

export interface DropdownNavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  badge?: number;
  premium?: boolean;
  description?: string;
}

export interface DropdownNavigationCategory {
  id: string;
  label: string;
  items: DropdownNavigationItem[];
}

export interface SimpleDropdownMenuProps {
  className?: string;
}

const SimpleDropdownMenu: React.FC<SimpleDropdownMenuProps> = ({ className }) => {
  const { currentRoute, navigateWithState } = useNavigationContext();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickInsideAnyDropdown = Object.values(dropdownRefs.current).some(
        ref => ref && ref.contains(target)
      );
      
      if (!isClickInsideAnyDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownCategories: DropdownNavigationCategory[] = [
    {
      id: 'blockchain',
      label: 'Blockchain',
      items: [
        { id: 'transactions', label: 'Transactions', icon: FaHistory, route: '/transactions', description: 'All network transactions' },
        { id: 'blocks', label: 'Blocks', icon: FaCube, route: '/blocks', description: 'Latest blocks' },
        { id: 'accounts', label: 'Accounts', icon: FaWallet, route: '/accounts', description: 'Network accounts' },
        { id: 'validators', label: 'Validators', icon: FaServer, route: '/validators', description: 'Network validators' },
        { id: 'packages', label: 'Packages', icon: FaCode, route: '/packages', description: 'Smart contract packages' },
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      items: [
        { id: 'network-analytics', label: 'Network Analytics', icon: RiBarChartLine, route: '/analytics', description: 'Comprehensive network statistics' },
        { id: 'dashboard', label: 'Dashboard', icon: RiDashboardHorizontalFill, route: '/dashboard', description: 'Analytics dashboard overview' },
        { id: 'gas-trends', label: 'Gas Trends', icon: FaChartLine, route: '/analytics/gas-fees', description: 'Gas fee trends and analysis' },
      ]
    },
    {
      id: 'leaderboards',
      label: 'Leaderboards',
      items: [
        { id: 'top-accounts', label: 'Top Accounts', icon: FaWallet, route: '/leaderboard/accounts', description: 'Richest accounts by balance' },
        { id: 'top-tokens', label: 'Top Tokens', icon: FaCoins, route: '/leaderboard/tokens', description: 'Most valuable tokens' },
        { id: 'top-validators', label: 'Top Validators', icon: FaServer, route: '/leaderboard/validators', description: 'Top performing validators' },
        { id: 'whale-tracking', label: 'Whale Tracking', icon: FaChartLine, route: '/whale-tracking', description: 'Track large token holders' },
        { id: 'top-nfts', label: 'Top NFTs', icon: RiImageLine, route: '/nfts', description: 'Most valuable NFT collections' },
      ]
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      items: [
        { id: 'portfolio-overview', label: 'Portfolio Overview', icon: RiDashboardHorizontalFill, route: '/portfolio', description: 'Summary dashboard of your portfolio' },
        { id: 'my-transactions', label: 'My Transactions', icon: FaHistory, route: '/portfolio/history', description: 'Your transaction history' },
        { id: 'my-collection', label: 'My Collection', icon: RiImageLine, route: '/AccountNfts', description: 'Your NFT collection' },
        { id: 'watchlist', label: 'Watchlist', icon: FaStar, route: '/watchlist', description: 'Your favorite tokens' },
      ]
    },
    {
      id: 'resources',
      label: 'Resources',
      items: [
        { id: 'docs', label: 'Documentation', icon: FaBook, route: '/docs', description: 'Learn about the platform' },
        { id: 'api', label: 'API', icon: FaCode, route: '/api', description: 'Developer resources' },
        { id: 'support', label: 'Support', icon: FaQuestionCircle, route: '/support', description: 'Get help' },
      ]
    },
    {
      id: 'more',
      label: 'More',
      items: [
        { id: 'tools', label: 'Tools', icon: FaTools, route: '/tools', description: 'Utility tools' },
        { id: 'advanced-search', label: 'Advanced Search', icon: FaSearch, route: '/advanced-search', description: 'Comprehensive search with filters' },
        { id: 'export', label: 'Export Data', icon: FaEllipsisH, route: '/export', description: 'Export blockchain data' },
        { id: 'premium', label: 'Premium', icon: FaCrown, route: '/premium', premium: true, description: 'Upgrade to premium' },
        { id: 'defi', label: 'DeFi', icon: RiExchangeLine, route: '/defi', description: 'Decentralized Finance tools' },
        { id: 'tokens', label: 'Tokens', icon: FaCoins, route: '/tokens', description: 'Token explorer and analytics' },
      ]
    }
  ];

  const isRouteActive = (route: string): boolean => {
    if (route === '/dashboard' && currentRoute === '/') return true;
    return currentRoute === route;
  };

  const handleNavigation = (route: string) => {
    navigateWithState(route);
    setOpenDropdown(null);
  };

  const handleDropdownToggle = (categoryId: string) => {
    setOpenDropdown(openDropdown === categoryId ? null : categoryId);
  };

  return (
    <nav className={cn('flex items-center gap-1', className)}>
      {dropdownCategories.map((category) => {
        const isActive = category.items.some(item => isRouteActive(item.route));
        const isOpen = openDropdown === category.id;

        return (
          <div
            key={category.id}
            className="relative"
            ref={el => { dropdownRefs.current[category.id] = el; }}
          >
            {/* Trigger Button */}
            <button
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none',
                {
                  'bg-accent text-accent-foreground': isActive || isOpen
                }
              )}
              onClick={() => handleDropdownToggle(category.id)}
              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              {category.label}
              <FaChevronDown
                className={cn('h-3 w-3 transition-transform duration-200', {
                  'rotate-180': isOpen
                })}
              />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-[400px] rounded-md border bg-popover p-4 text-popover-foreground shadow-md md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                <div className="grid gap-3 md:grid-cols-2">
                  {category.items.map((item) => {
                    const IconComponent = item.icon;
                    const itemIsActive = isRouteActive(item.route);

                    return (
                      <button
                        key={item.id}
                        className={cn(
                          'flex items-start gap-3 rounded-md p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none',
                          {
                            'bg-accent text-accent-foreground': itemIsActive,
                            'border border-primary': item.premium
                          }
                        )}
                        onClick={() => handleNavigation(item.route)}
                        title={item.description}
                      >
                        <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.label}</span>
                            {item.premium && (
                              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                Pro
                              </span>
                            )}
                            {item.badge && (
                              <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default SimpleDropdownMenu;
