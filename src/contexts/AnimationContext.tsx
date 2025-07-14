import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { animationManager, prefersReducedMotion } from '@/lib/animations';
import { performanceOptimizer, scrollController } from '@/lib/performance';
import { accessibilityManager } from '@/lib/accessibility';

// Animation context types
interface AnimationContextType {
  isReducedMotion: boolean;
  isAnimationEnabled: boolean;
  toggleAnimations: () => void;
  pauseAllAnimations: () => void;
  resumeAllAnimations: () => void;
  killAllAnimations: () => void;
  performanceMode: 'high' | 'balanced' | 'low';
  setPerformanceMode: (mode: 'high' | 'balanced' | 'low') => void;
  // Performance metrics
  frameRate: number;
  isLowPerformance: boolean;
  // Accessibility
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  manageFocus: (element: Element | null, options?: any) => void;
}

// Create the context
const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

// Animation provider props
interface AnimationProviderProps {
  children: ReactNode;
  defaultPerformanceMode?: 'high' | 'balanced' | 'low';
}

// Performance mode configurations
const PERFORMANCE_CONFIGS = {
  high: {
    enableStagger: true,
    enableComplexAnimations: true,
    maxConcurrentAnimations: 10,
    enableWillChange: true,
  },
  balanced: {
    enableStagger: true,
    enableComplexAnimations: false,
    maxConcurrentAnimations: 5,
    enableWillChange: true,
  },
  low: {
    enableStagger: false,
    enableComplexAnimations: false,
    maxConcurrentAnimations: 2,
    enableWillChange: false,
  },
} as const;

// Animation provider component
export const AnimationProvider: React.FC<AnimationProviderProps> = ({
  children,
  defaultPerformanceMode = 'balanced',
}) => {
  const [isReducedMotion, setIsReducedMotion] = useState(prefersReducedMotion());
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(!prefersReducedMotion());
  const [performanceMode, setPerformanceMode] = useState<'high' | 'balanced' | 'low'>(
    defaultPerformanceMode
  );
  const [frameRate, setFrameRate] = useState(60);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  // Listen for changes in motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
      setIsAnimationEnabled(!e.matches);
      
      if (e.matches) {
        animationManager.killAllAnimations();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Performance monitoring
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measurePerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setFrameRate(fps);
        setIsLowPerformance(fps < 30);

        // Auto-adjust performance mode based on FPS
        if (fps < 30 && performanceMode === 'high') {
          setPerformanceMode('balanced');
        } else if (fps < 20 && performanceMode === 'balanced') {
          setPerformanceMode('low');
        }

        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measurePerformance);
    };

    if (isAnimationEnabled) {
      animationId = requestAnimationFrame(measurePerformance);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isAnimationEnabled, performanceMode]);

  // Scroll-based animation pausing
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let isScrolling = false;

    const handleScroll = () => {
      if (!isScrolling && performanceMode !== 'high') {
        isScrolling = true;
        animationManager.pauseAllAnimations();
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        if (isAnimationEnabled) {
          animationManager.resumeAllAnimations();
        }
      }, 150);
    };

    if (isAnimationEnabled && performanceMode !== 'high') {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isAnimationEnabled, performanceMode]);

  // Context value
  const contextValue: AnimationContextType = {
    isReducedMotion,
    isAnimationEnabled,
    toggleAnimations: () => {
      const newState = !isAnimationEnabled;
      setIsAnimationEnabled(newState);

      if (!newState) {
        animationManager.killAllAnimations();
      }
    },
    pauseAllAnimations: () => {
      animationManager.pauseAllAnimations();
    },
    resumeAllAnimations: () => {
      if (isAnimationEnabled) {
        animationManager.resumeAllAnimations();
      }
    },
    killAllAnimations: () => {
      animationManager.killAllAnimations();
    },
    performanceMode,
    setPerformanceMode: (mode: 'high' | 'balanced' | 'low') => {
      setPerformanceMode(mode);

      // Apply performance optimizations
      const config = PERFORMANCE_CONFIGS[mode];

      if (!config.enableComplexAnimations) {
        // Simplify existing animations
        animationManager.killAllAnimations();
      }
    },
    frameRate,
    isLowPerformance,
    announceToScreenReader: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      accessibilityManager.announceToScreenReader(message, priority);
    },
    manageFocus: (element: Element | null, options?: any) => {
      accessibilityManager.manageFocus(element, options);
    },
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

// Custom hook to use animation context
export const useAnimation = (): AnimationContextType => {
  const context = useContext(AnimationContext);
  
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  
  return context;
};

// Custom hook for conditional animations
export const useConditionalAnimation = () => {
  const { isAnimationEnabled, performanceMode } = useAnimation();
  
  return {
    shouldAnimate: isAnimationEnabled,
    shouldUseStagger: isAnimationEnabled && PERFORMANCE_CONFIGS[performanceMode].enableStagger,
    shouldUseComplexAnimations: isAnimationEnabled && PERFORMANCE_CONFIGS[performanceMode].enableComplexAnimations,
    shouldUseWillChange: isAnimationEnabled && PERFORMANCE_CONFIGS[performanceMode].enableWillChange,
    maxConcurrentAnimations: PERFORMANCE_CONFIGS[performanceMode].maxConcurrentAnimations,
  };
};

// HOC for animation-aware components
export const withAnimation = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => (
    <AnimationProvider>
      <Component {...props} />
    </AnimationProvider>
  );
};

// Accessibility utilities
export const announceToScreenReader = (message: string): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management utilities
export const manageFocus = (element: Element | null): void => {
  if (!element) return;
  
  // Ensure element is focusable
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1');
  }
  
  // Focus with animation consideration
  const { isReducedMotion } = useAnimation();
  
  if (isReducedMotion) {
    (element as HTMLElement).focus();
  } else {
    // Delay focus to allow animation to complete
    setTimeout(() => {
      (element as HTMLElement).focus();
    }, 300);
  }
};

export default AnimationProvider;
