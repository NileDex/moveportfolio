import { useState, useEffect, useCallback } from 'react';

// Theme mode type
export type ThemeMode = 'dark' | 'light';

// Theme context type
export interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  isLight: boolean;
}

// Local storage key for theme persistence
const THEME_STORAGE_KEY = 'portfolio-app-theme';

// Default theme
const DEFAULT_THEME: ThemeMode = 'dark';

/**
 * Custom hook for theme management
 * Handles theme switching, persistence, and system preference detection
 */
export const useTheme = (): ThemeContextType => {
  // Initialize theme from localStorage or system preference
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      return savedTheme;
    }
    
    // Fall back to system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    
    return DEFAULT_THEME;
  });

  // Apply theme to document root
  const applyTheme = useCallback((newTheme: ThemeMode) => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Add current theme class (shadcn/ui uses class-based theming)
    root.classList.add(newTheme);

    // Set data attribute for CSS selectors
    root.setAttribute('data-theme', newTheme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const themeColor = newTheme === 'dark' ? '#0f0f0f' : '#faf9f7';
      metaThemeColor.setAttribute('content', themeColor);
    }
  }, []);

  // Set theme with persistence
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // Toggle between themes
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no theme is saved in localStorage
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        const systemTheme = e.matches ? 'dark' : 'light';
        setThemeState(systemTheme);
        applyTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme]);

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};

/**
 * Hook to get current theme colors from CSS custom properties
 * Returns the color palette for the current theme
 */
export const useThemeColors = () => {
  const { theme } = useTheme();

  // Get colors from CSS custom properties
  const getColor = (property: string) => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
  };

  return {
    background: getColor('--background'),
    foreground: getColor('--foreground'),
    card: getColor('--card'),
    cardForeground: getColor('--card-foreground'),
    primary: getColor('--primary'),
    primaryForeground: getColor('--primary-foreground'),
    secondary: getColor('--secondary'),
    secondaryForeground: getColor('--secondary-foreground'),
    muted: getColor('--muted'),
    mutedForeground: getColor('--muted-foreground'),
    accent: getColor('--accent'),
    accentForeground: getColor('--accent-foreground'),
    destructive: getColor('--destructive'),
    destructiveForeground: getColor('--destructive-foreground'),
    border: getColor('--border'),
    input: getColor('--input'),
    ring: getColor('--ring'),
  };
};

/**
 * Hook to create theme-aware styles
 * Useful for component-specific styling that needs theme awareness
 */
export const useThemeStyles = () => {
  const { theme, isDark, isLight } = useTheme();
  const colors = useThemeColors();

  return {
    theme,
    isDark,
    isLight,
    colors,
    // Common style patterns using CSS custom properties
    cardStyle: {
      backgroundColor: `hsl(var(--card))`,
      borderColor: `hsl(var(--border))`,
      color: `hsl(var(--card-foreground))`,
    },
    buttonPrimaryStyle: {
      backgroundColor: `hsl(var(--primary))`,
      color: `hsl(var(--primary-foreground))`,
    },
    buttonSecondaryStyle: {
      backgroundColor: `hsl(var(--secondary))`,
      borderColor: `hsl(var(--border))`,
      color: `hsl(var(--secondary-foreground))`,
    },
    inputStyle: {
      backgroundColor: `hsl(var(--background))`,
      borderColor: `hsl(var(--border))`,
      color: `hsl(var(--foreground))`,
    },
  };
};

/**
 * Utility function to get CSS custom property value
 */
export const getCSSCustomProperty = (property: string): string => {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
};

/**
 * Utility function to set CSS custom property
 */
export const setCSSCustomProperty = (property: string, value: string): void => {
  if (typeof window === 'undefined') return;
  document.documentElement.style.setProperty(property, value);
};

/**
 * Hook for responsive theme behavior
 * Adjusts theme based on screen size or user preferences
 */
export const useResponsiveTheme = () => {
  const themeHook = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    ...themeHook,
    isMobile,
    // Mobile-specific theme adjustments can be added here
  };
};
