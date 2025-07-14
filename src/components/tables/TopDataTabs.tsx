import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import TopAccountsTable from './TopAccountsTable';
import TopValidatorsTable from './TopValidatorsTable';
import TopTokensTable from './TopTokensTable';
import RecentPackagesTable from './RecentPackagesTable';

/**
 * TopDataTabs Component
 * Unified tabbed interface combining all top data tables
 * Similar to SuiVision's tabbed layout design
 */

interface TabConfig {
  id: string;
  label: string;
  component: React.ComponentType<{ hideTitle?: boolean }>;
}

const TopDataTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('accounts');

  const tabs: TabConfig[] = [
    {
      id: 'accounts',
      label: 'Top Accounts',
      component: TopAccountsTable
    },
    {
      id: 'validators',
      label: 'Top Validators',
      component: TopValidatorsTable
    },
    {
      id: 'tokens',
      label: 'Top Tokens',
      component: TopTokensTable
    },
    {
      id: 'packages',
      label: 'Recent Packages',
      component: RecentPackagesTable
    }
  ];

  const renderActiveComponent = () => {
    const activeTabConfig = tabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return null;

    const Component = activeTabConfig.component;
    return <Component hideTitle={true} />;
  };

  return (
    <div className="w-full relative z-10">
      {/* Tab Navigation - REMOVED GRAY BACKGROUND */}
      <div className="border-b border-border/20 mb-6">
        <div className="flex space-x-0 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap border-b-2 min-w-fit',
                {
                  'text-primary border-primary bg-primary/5 shadow-sm': activeTab === tab.id,
                  'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/20': activeTab !== tab.id
                }
              )}
              style={{
                textShadow: activeTab === tab.id ? '0 0 8px rgba(189, 171, 76, 0.3)' : 'none'
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-sm"
                  style={{
                    background: 'linear-gradient(90deg, #BDAB4C 0%, #DAD6C5 100%)'
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default TopDataTabs;
