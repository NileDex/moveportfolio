/**
 * Hooks Index
 * Central export point for all custom hooks
 */

// Theme hooks
export { useTheme } from './useTheme';

// Navigation hooks
export { 
  useNavigation, 
  useBreadcrumbs, 
  useNavigationPreferences 
} from './useNavigation';

// Responsive hooks
export { 
  useResponsive,
  useResponsiveValue,
  useMediaQuery,
  useBreakpoint,
  useTouchOptimization,
  useResponsiveGrid,
  useResponsiveSpacing,
  useResponsiveFontSize,
  useContainerQuery
} from './useResponsive';

// Re-export types
export type { ResponsiveState } from './useResponsive';
export type { NavigationState, NavigationPreferences } from './useNavigation';
