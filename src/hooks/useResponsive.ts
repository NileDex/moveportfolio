import { useState, useEffect, useCallback, useMemo } from 'react';


// Responsive state interface
export interface ResponsiveState {
  // Current breakpoint
  currentBreakpoint: BreakpointKey;
  
  // Screen size booleans
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  
  // Device capabilities
  isTouchDevice: boolean;
  hasHover: boolean;
  prefersReducedMotion: boolean;
  isHighDPI: boolean;
  
  // Screen dimensions
  windowWidth: number;
  windowHeight: number;
  
  // Orientation
  isPortrait: boolean;
  isLandscape: boolean;
}

/**
 * Custom hook for responsive design and device detection
 * Provides real-time information about screen size, device capabilities, and user preferences
 */
export const useResponsive = (): ResponsiveState => {
  // Initialize state with default values (SSR-safe)
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : breakpoints.desktop,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const [deviceCapabilities, setDeviceCapabilities] = useState({
    isTouchDevice: false,
    hasHover: true,
    prefersReducedMotion: false,
    isHighDPI: false,
  });

  // Update window size
  const updateWindowSize = useCallback(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  // Update device capabilities
  const updateDeviceCapabilities = useCallback(() => {
    if (typeof window !== 'undefined') {
      setDeviceCapabilities({
        isTouchDevice: deviceUtils.isTouchDevice(),
        hasHover: deviceUtils.hasHover(),
        prefersReducedMotion: deviceUtils.prefersReducedMotion(),
        isHighDPI: deviceUtils.isHighDPI(),
      });
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial update
    updateWindowSize();
    updateDeviceCapabilities();

    // Resize listener
    const handleResize = () => {
      updateWindowSize();
    };

    // Media query listeners for device capabilities
    const touchQuery = window.matchMedia('(pointer: coarse)');
    const hoverQuery = window.matchMedia('(hover: hover)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dpiQuery = window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)');

    const handleMediaChange = () => {
      updateDeviceCapabilities();
    };

    // Add event listeners
    window.addEventListener('resize', handleResize);
    touchQuery.addEventListener('change', handleMediaChange);
    hoverQuery.addEventListener('change', handleMediaChange);
    motionQuery.addEventListener('change', handleMediaChange);
    dpiQuery.addEventListener('change', handleMediaChange);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      touchQuery.removeEventListener('change', handleMediaChange);
      hoverQuery.removeEventListener('change', handleMediaChange);
      motionQuery.removeEventListener('change', handleMediaChange);
      dpiQuery.removeEventListener('change', handleMediaChange);
    };
  }, [updateWindowSize, updateDeviceCapabilities]);

  // Calculate responsive state
  const responsiveState = useMemo((): ResponsiveState => {
    const { width, height } = windowSize;

    // Determine current breakpoint
    let currentBreakpoint: BreakpointKey = 'mobile';
    if (width >= breakpoints.wide) {
      currentBreakpoint = 'wide';
    } else if (width >= breakpoints.desktop) {
      currentBreakpoint = 'desktop';
    } else if (width >= breakpoints.tablet) {
      currentBreakpoint = 'tablet';
    }

    // Calculate screen size booleans
    const isMobile = width < breakpoints.tablet;
    const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
    const isDesktop = width >= breakpoints.desktop && width < breakpoints.wide;
    const isWide = width >= breakpoints.wide;

    // Calculate orientation
    const isPortrait = height > width;
    const isLandscape = width > height;

    return {
      currentBreakpoint,
      isMobile,
      isTablet,
      isDesktop,
      isWide,
      windowWidth: width,
      windowHeight: height,
      isPortrait,
      isLandscape,
      ...deviceCapabilities,
    };
  }, [windowSize, deviceCapabilities]);

  return responsiveState;
};

/**
 * Hook for responsive values that change based on breakpoint
 */
export const useResponsiveValue = <T>(values: Partial<Record<BreakpointKey, T>>): T | undefined => {
  const { currentBreakpoint } = useResponsive();

  return useMemo(() => {
    // Return value for current breakpoint or fallback to smaller breakpoints
    if (values[currentBreakpoint] !== undefined) {
      return values[currentBreakpoint];
    }

    // Fallback logic: try smaller breakpoints
    const breakpointOrder: BreakpointKey[] = ['wide', 'desktop', 'tablet', 'mobile'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

    for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
      const fallbackBreakpoint = breakpointOrder[i];
      if (values[fallbackBreakpoint] !== undefined) {
        return values[fallbackBreakpoint];
      }
    }

    return undefined;
  }, [values, currentBreakpoint]);
};

/**
 * Hook for media query matching
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

/**
 * Hook for specific breakpoint detection
 */
export const useBreakpoint = (breakpoint: BreakpointKey): boolean => {
  const query = `(min-width: ${breakpoints[breakpoint]}px)`;
  return useMediaQuery(query);
};

/**
 * Hook for touch device optimization
 */
export const useTouchOptimization = () => {
  const { isTouchDevice, hasHover, prefersReducedMotion } = useResponsive();

  return useMemo(() => ({
    // Touch-specific styles
    touchStyles: isTouchDevice ? {
      minHeight: '44px',
      minWidth: '44px',
      fontSize: '16px', // Prevents zoom on iOS
    } : {},

    // Hover styles (only apply on devices that support hover)
    hoverStyles: hasHover ? {
      cursor: 'pointer',
    } : {},

    // Animation styles (respect reduced motion preference)
    animationStyles: prefersReducedMotion ? {
      transition: 'none',
      animation: 'none',
    } : {
      transition: 'all 0.3s ease',
    },

    // Interaction flags
    shouldShowHoverEffects: hasHover && !isTouchDevice,
    shouldUseAnimations: !prefersReducedMotion,
    shouldOptimizeForTouch: isTouchDevice,
  }), [isTouchDevice, hasHover, prefersReducedMotion]);
};

/**
 * Hook for responsive grid columns
 */
export const useResponsiveGrid = (
  columns: Partial<Record<BreakpointKey, number>>
): number => {
  const currentColumns = useResponsiveValue(columns);
  return currentColumns || 1;
};

/**
 * Hook for responsive spacing
 */
export const useResponsiveSpacing = (
  spacing: Partial<Record<BreakpointKey, string | number>>
): string => {
  const currentSpacing = useResponsiveValue(spacing);
  
  if (typeof currentSpacing === 'number') {
    return `${currentSpacing * 8}px`; // 8px base unit
  }
  
  return currentSpacing || '16px';
};

/**
 * Hook for responsive font sizes
 */
export const useResponsiveFontSize = (
  sizes: Partial<Record<BreakpointKey, string>>
): string => {
  const currentSize = useResponsiveValue(sizes);
  return currentSize || '16px';
};

/**
 * Hook for container-based responsive behavior
 */
export const useContainerQuery = (containerRef: React.RefObject<HTMLElement>) => {
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return {
    containerWidth,
    isContainerSmall: containerWidth < 400,
    isContainerMedium: containerWidth >= 400 && containerWidth < 600,
    isContainerLarge: containerWidth >= 600,
  };
};

export default useResponsive;
