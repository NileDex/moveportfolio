import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { NavigationItem, BreadcrumbItem } from '../components/layout';

// Navigation preferences type
export interface NavigationPreferences {
  showLabels: boolean;
  compactMode: boolean;
  favoriteRoutes: string[];
  recentRoutes: string[];
  navigationLayout: 'horizontal' | 'vertical';
}

// Navigation state type
export interface NavigationState {
  currentRoute: string;
  previousRoute: string | null;
  breadcrumbs: BreadcrumbItem[];
  activeNavItem: NavigationItem | null;
  isNavigating: boolean;
  preferences: NavigationPreferences;
}

// Local storage keys
const NAVIGATION_PREFERENCES_KEY = 'portfolio-navigation-preferences';
const RECENT_ROUTES_KEY = 'portfolio-recent-routes';

// Default preferences
const DEFAULT_PREFERENCES: NavigationPreferences = {
  showLabels: true,
  compactMode: false,
  favoriteRoutes: ['/dashboard', '/transactions'],
  recentRoutes: [],
  navigationLayout: 'horizontal'
};

// Route metadata for breadcrumb generation
const ROUTE_METADATA: Record<string, { label: string; parent?: string; icon?: string }> = {
  '/dashboard': { label: 'Dashboard' },
  '/transactions': { label: 'Transactions', parent: '/dashboard' },
  '/NetworthDistribution': { label: 'Portfolio', parent: '/dashboard' },
  '/AccountNfts': { label: 'NFTs', parent: '/dashboard' },
  '/analytics': { label: 'Analytics', parent: '/dashboard' },
  '/settings': { label: 'Settings' },
  '/portfolio': { label: 'Portfolio' }
};

/**
 * Custom hook for navigation state management
 * Handles active route tracking, breadcrumb generation, and user preferences
 */
export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Load preferences from localStorage
  const [preferences, setPreferences] = useState<NavigationPreferences>(() => {
    try {
      const saved = localStorage.getItem(NAVIGATION_PREFERENCES_KEY);
      return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Current route
  const currentRoute = location.pathname;

  // Generate breadcrumbs from current route
  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const generateBreadcrumbs = (path: string): BreadcrumbItem[] => {
      const crumbs: BreadcrumbItem[] = [];
      const metadata = ROUTE_METADATA[path];
      
      if (!metadata) return crumbs;

      // Add parent breadcrumbs recursively
      if (metadata.parent && metadata.parent !== path) {
        crumbs.push(...generateBreadcrumbs(metadata.parent));
      }

      // Add current breadcrumb
      crumbs.push({
        label: metadata.label,
        path: path
      });

      return crumbs;
    };

    return generateBreadcrumbs(currentRoute);
  }, [currentRoute]);

  // Find active navigation item
  const activeNavItem = useMemo((): NavigationItem | null => {
    // This would be imported from NavigationMenu, but to avoid circular imports,
    // we'll define a minimal version here
    const navItems: NavigationItem[] = [
      { id: 'dashboard', label: 'Dashboard', icon: () => null, route: '/dashboard' },
      { id: 'transactions', label: 'Transactions', icon: () => null, route: '/transactions' },
      { id: 'portfolio', label: 'Portfolio', icon: () => null, route: '/NetworthDistribution' },
      { id: 'nfts', label: 'NFTs', icon: () => null, route: '/AccountNfts' },
      { id: 'analytics', label: 'Analytics', icon: () => null, route: '/analytics', premium: true }
    ];

    return navItems.find(item => 
      currentRoute === item.route || 
      (item.route !== '/' && currentRoute.startsWith(item.route + '/'))
    ) || null;
  }, [currentRoute]);

  // Update preferences and persist to localStorage
  const updatePreferences = useCallback((updates: Partial<NavigationPreferences>) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, ...updates };
      try {
        localStorage.setItem(NAVIGATION_PREFERENCES_KEY, JSON.stringify(newPreferences));
      } catch (error) {
        console.error('Failed to save navigation preferences:', error);
      }
      return newPreferences;
    });
  }, []);

  // Add route to recent routes
  const addToRecentRoutes = useCallback((route: string) => {
    if (route === '/portfolio') return; // Don't add landing page to recent

    updatePreferences(prev => {
      const recentRoutes = [route, ...prev.recentRoutes.filter(r => r !== route)].slice(0, 5);
      return { ...prev, recentRoutes };
    });
  }, [updatePreferences]);

  // Toggle favorite route
  const toggleFavoriteRoute = useCallback((route: string) => {
    updatePreferences(prev => {
      const favoriteRoutes = prev.favoriteRoutes.includes(route)
        ? prev.favoriteRoutes.filter(r => r !== route)
        : [...prev.favoriteRoutes, route];
      return { ...prev, favoriteRoutes };
    });
  }, [updatePreferences]);

  // Navigate with state management
  const navigateWithState = useCallback((to: string, options?: { replace?: boolean }) => {
    setIsNavigating(true);
    setPreviousRoute(currentRoute);
    
    // Add to recent routes
    addToRecentRoutes(to);
    
    // Navigate
    if (options?.replace) {
      navigate(to, { replace: true });
    } else {
      navigate(to);
    }
    
    // Reset navigating state after a short delay
    setTimeout(() => setIsNavigating(false), 300);
  }, [navigate, currentRoute, addToRecentRoutes]);

  // Go back to previous route
  const goBack = useCallback(() => {
    if (previousRoute) {
      navigateWithState(previousRoute);
    } else {
      navigate(-1);
    }
  }, [previousRoute, navigateWithState, navigate]);

  // Check if route is active
  const isRouteActive = useCallback((route: string): boolean => {
    if (route === '/dashboard' && currentRoute === '/') return true;
    return currentRoute === route || currentRoute.startsWith(route + '/');
  }, [currentRoute]);

  // Check if route is favorite
  const isRouteFavorite = useCallback((route: string): boolean => {
    return preferences.favoriteRoutes.includes(route);
  }, [preferences.favoriteRoutes]);

  // Get route display name
  const getRouteDisplayName = useCallback((route: string): string => {
    return ROUTE_METADATA[route]?.label || route.split('/').pop() || 'Unknown';
  }, []);

  // Update route tracking
  useEffect(() => {
    addToRecentRoutes(currentRoute);
  }, [currentRoute, addToRecentRoutes]);

  // Navigation state object
  const navigationState: NavigationState = {
    currentRoute,
    previousRoute,
    breadcrumbs,
    activeNavItem,
    isNavigating,
    preferences
  };

  return {
    // State
    ...navigationState,
    
    // Actions
    navigateWithState,
    goBack,
    updatePreferences,
    toggleFavoriteRoute,
    
    // Utilities
    isRouteActive,
    isRouteFavorite,
    getRouteDisplayName,
    
    // Preferences shortcuts
    setShowLabels: (show: boolean) => updatePreferences({ showLabels: show }),
    setCompactMode: (compact: boolean) => updatePreferences({ compactMode: compact }),
    setNavigationLayout: (layout: 'horizontal' | 'vertical') => updatePreferences({ navigationLayout: layout })
  };
};

/**
 * Hook for breadcrumb management
 * Provides utilities for custom breadcrumb manipulation
 */
export const useBreadcrumbs = () => {
  const { breadcrumbs, currentRoute } = useNavigation();
  
  // Generate custom breadcrumbs
  const generateCustomBreadcrumbs = useCallback((items: BreadcrumbItem[]): BreadcrumbItem[] => {
    return items.map(item => ({
      ...item,
      // Ensure paths are absolute
      path: item.path.startsWith('/') ? item.path : `/${item.path}`
    }));
  }, []);

  // Get parent breadcrumb
  const getParentBreadcrumb = useCallback((): BreadcrumbItem | null => {
    return breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;
  }, [breadcrumbs]);

  // Get current breadcrumb
  const getCurrentBreadcrumb = useCallback((): BreadcrumbItem | null => {
    return breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null;
  }, [breadcrumbs]);

  return {
    breadcrumbs,
    generateCustomBreadcrumbs,
    getParentBreadcrumb,
    getCurrentBreadcrumb,
    currentRoute
  };
};

/**
 * Hook for navigation preferences
 * Simplified interface for managing user navigation preferences
 */
export const useNavigationPreferences = () => {
  const { preferences, updatePreferences } = useNavigation();
  
  return {
    preferences,
    updatePreferences,
    
    // Convenience methods
    toggleLabels: () => updatePreferences({ showLabels: !preferences.showLabels }),
    toggleCompactMode: () => updatePreferences({ compactMode: !preferences.compactMode }),
    setLayout: (layout: 'horizontal' | 'vertical') => updatePreferences({ navigationLayout: layout })
  };
};
