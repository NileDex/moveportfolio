import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigation, type NavigationState, type NavigationPreferences } from '../hooks/useNavigation';

// Navigation context type
interface NavigationContextType extends ReturnType<typeof useNavigation> {
  // Additional context-specific methods
  setPageTitle: (title: string) => void;
  pageTitle: string;
  navigationHistory: string[];
  clearNavigationHistory: () => void;
}

// Create context
const NavigationContext = createContext<NavigationContextType | null>(null);

// Navigation provider props
interface NavigationProviderProps {
  children: React.ReactNode;
}

/**
 * NavigationProvider Component
 * Provides navigation state and methods to the entire application
 */
export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const navigation = useNavigation();
  const location = useLocation();
  
  // Page title state
  const [pageTitle, setPageTitle] = useState<string>('');
  
  // Navigation history state
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // Update page title based on current route
  useEffect(() => {
    const routeTitles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/transactions': 'Transactions',
      '/NetworthDistribution': 'Portfolio Distribution',
      '/AccountNfts': 'NFT Collection',
      '/analytics': 'Analytics',
      '/settings': 'Settings',
      '/portfolio': 'Portfolio Overview',
      // Explorer routes
      '/blocks': 'Blocks',
      '/validators': 'Validators',
      '/tokens': 'Tokens',
      '/api-docs': 'API Documentation'
    };

    const title = routeTitles[location.pathname] || 'Portfolio App';
    setPageTitle(title);
    
    // Update document title
    document.title = `${title} | Metacoms Portfolio`;
  }, [location.pathname]);

  // Track navigation history
  useEffect(() => {
    setNavigationHistory(prev => {
      const newHistory = [location.pathname, ...prev.filter(path => path !== location.pathname)];
      return newHistory.slice(0, 10); // Keep last 10 routes
    });
  }, [location.pathname]);

  // Clear navigation history
  const clearNavigationHistory = () => {
    setNavigationHistory([]);
  };

  // Context value
  const contextValue: NavigationContextType = {
    ...navigation,
    pageTitle,
    setPageTitle,
    navigationHistory,
    clearNavigationHistory
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * Hook to use navigation context
 * Throws error if used outside NavigationProvider
 */
export const useNavigationContext = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  
  if (!context) {
    throw new Error('useNavigationContext must be used within a NavigationProvider');
  }
  
  return context;
};

/**
 * Hook for route-specific navigation utilities
 */
export const useRouteNavigation = () => {
  const { 
    currentRoute, 
    navigateWithState, 
    isRouteActive, 
    getRouteDisplayName,
    breadcrumbs 
  } = useNavigationContext();

  // Navigate to specific routes with type safety
  const goToDashboard = () => navigateWithState('/dashboard');
  const goToTransactions = () => navigateWithState('/transactions');
  const goToPortfolio = () => navigateWithState('/NetworthDistribution');
  const goToNFTs = () => navigateWithState('/AccountNfts');
  const goToAnalytics = () => navigateWithState('/analytics');
  const goToSettings = () => navigateWithState('/settings');

  // Check if specific routes are active
  const isDashboardActive = isRouteActive('/dashboard');
  const isTransactionsActive = isRouteActive('/transactions');
  const isPortfolioActive = isRouteActive('/NetworthDistribution');
  const isNFTsActive = isRouteActive('/AccountNfts');
  const isAnalyticsActive = isRouteActive('/analytics');

  return {
    // Current state
    currentRoute,
    breadcrumbs,
    
    // Navigation methods
    goToDashboard,
    goToTransactions,
    goToPortfolio,
    goToNFTs,
    goToAnalytics,
    goToSettings,
    
    // Active state checks
    isDashboardActive,
    isTransactionsActive,
    isPortfolioActive,
    isNFTsActive,
    isAnalyticsActive,
    
    // Utilities
    getRouteDisplayName,
    isRouteActive
  };
};

/**
 * Hook for navigation analytics and tracking
 */
export const useNavigationAnalytics = () => {
  const { 
    navigationHistory, 
    preferences, 
    currentRoute,
    previousRoute 
  } = useNavigationContext();

  // Get most visited routes
  const getMostVisitedRoutes = () => {
    const routeCounts = navigationHistory.reduce((acc, route) => {
      acc[route] = (acc[route] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(routeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([route, count]) => ({ route, count }));
  };

  // Get navigation patterns
  const getNavigationPatterns = () => {
    const patterns: Record<string, string[]> = {};
    
    for (let i = 1; i < navigationHistory.length; i++) {
      const from = navigationHistory[i];
      const to = navigationHistory[i - 1];
      
      if (!patterns[from]) patterns[from] = [];
      patterns[from].push(to);
    }

    return patterns;
  };

  // Track navigation event
  const trackNavigation = (from: string, to: string, method: 'click' | 'keyboard' | 'programmatic' = 'click') => {
    // This could be extended to send analytics to external services
    console.log('Navigation tracked:', { from, to, method, timestamp: new Date().toISOString() });
  };

  return {
    navigationHistory,
    getMostVisitedRoutes,
    getNavigationPatterns,
    trackNavigation,
    currentRoute,
    previousRoute,
    preferences
  };
};

export default NavigationContext;
