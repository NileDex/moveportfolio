import { gsap } from 'gsap';

// Animation configuration types
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number;
  onComplete?: () => void;
  onStart?: () => void;
}

export interface StaggerConfig extends AnimationConfig {
  from?: 'start' | 'center' | 'end' | 'edges' | 'random';
  amount?: number;
}

// Easing presets optimized for cyberpunk theme
export const EASING = {
  // Physics-based easing for playful interactions
  BOUNCE_OUT: 'back.out(1.7)',
  BOUNCE_IN: 'back.in(1.7)',
  BOUNCE_INOUT: 'back.inOut(1.7)',
  
  // Smooth transitions
  EASE_OUT: 'power2.out',
  EASE_IN: 'power2.in',
  EASE_INOUT: 'power2.inOut',
  
  // Cyberpunk-style sharp transitions
  EXPO_OUT: 'expo.out',
  EXPO_IN: 'expo.in',
  EXPO_INOUT: 'expo.inOut',
  
  // Elastic for special effects
  ELASTIC_OUT: 'elastic.out(1, 0.3)',
  ELASTIC_IN: 'elastic.in(1, 0.3)',
} as const;

// Animation duration presets
export const DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
  VERY_SLOW: 0.8,
} as const;

// Stagger timing presets
export const STAGGER = {
  TIGHT: 0.05,
  NORMAL: 0.1,
  LOOSE: 0.15,
  VERY_LOOSE: 0.2,
} as const;

// Check for reduced motion preference
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Base animation class for performance optimization
export class AnimationManager {
  private static instance: AnimationManager;
  private activeAnimations: gsap.core.Timeline[] = [];
  private isReducedMotion: boolean;

  private constructor() {
    this.isReducedMotion = prefersReducedMotion();
    
    // Listen for changes in motion preference
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.isReducedMotion = e.matches;
      if (this.isReducedMotion) {
        this.killAllAnimations();
      }
    });
  }

  public static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  public shouldAnimate(): boolean {
    return !this.isReducedMotion;
  }

  public addAnimation(timeline: gsap.core.Timeline): void {
    this.activeAnimations.push(timeline);
  }

  public killAllAnimations(): void {
    this.activeAnimations.forEach(tl => tl.kill());
    this.activeAnimations = [];
  }

  public pauseAllAnimations(): void {
    this.activeAnimations.forEach(tl => tl.pause());
  }

  public resumeAllAnimations(): void {
    this.activeAnimations.forEach(tl => tl.resume());
  }
}

// Fade animations
export const fadeIn = (
  element: string | Element | Element[],
  config: AnimationConfig = {}
): gsap.core.Timeline => {
  const manager = AnimationManager.getInstance();
  
  if (!manager.shouldAnimate()) {
    gsap.set(element, { opacity: 1 });
    return gsap.timeline();
  }

  const tl = gsap.timeline({
    onComplete: config.onComplete,
    onStart: config.onStart,
  });

  tl.fromTo(element, 
    { opacity: 0 },
    {
      opacity: 1,
      duration: config.duration || DURATION.NORMAL,
      delay: config.delay || 0,
      ease: config.ease || EASING.EASE_OUT,
    }
  );

  manager.addAnimation(tl);
  return tl;
};

export const fadeOut = (
  element: string | Element | Element[],
  config: AnimationConfig = {}
): gsap.core.Timeline => {
  const manager = AnimationManager.getInstance();
  
  if (!manager.shouldAnimate()) {
    gsap.set(element, { opacity: 0 });
    return gsap.timeline();
  }

  const tl = gsap.timeline({
    onComplete: config.onComplete,
    onStart: config.onStart,
  });

  tl.to(element, {
    opacity: 0,
    duration: config.duration || DURATION.NORMAL,
    delay: config.delay || 0,
    ease: config.ease || EASING.EASE_IN,
  });

  manager.addAnimation(tl);
  return tl;
};

// Slide animations
export const slideUp = (
  element: string | Element | Element[],
  config: AnimationConfig = {}
): gsap.core.Timeline => {
  const manager = AnimationManager.getInstance();
  
  if (!manager.shouldAnimate()) {
    gsap.set(element, { y: 0, opacity: 1 });
    return gsap.timeline();
  }

  const tl = gsap.timeline({
    onComplete: config.onComplete,
    onStart: config.onStart,
  });

  tl.fromTo(element,
    { y: 30, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: config.duration || DURATION.NORMAL,
      delay: config.delay || 0,
      ease: config.ease || EASING.BOUNCE_OUT,
    }
  );

  manager.addAnimation(tl);
  return tl;
};

export const slideDown = (
  element: string | Element | Element[],
  config: AnimationConfig = {}
): gsap.core.Timeline => {
  const manager = AnimationManager.getInstance();
  
  if (!manager.shouldAnimate()) {
    gsap.set(element, { y: 0, opacity: 0 });
    return gsap.timeline();
  }

  const tl = gsap.timeline({
    onComplete: config.onComplete,
    onStart: config.onStart,
  });

  tl.to(element, {
    y: 30,
    opacity: 0,
    duration: config.duration || DURATION.NORMAL,
    delay: config.delay || 0,
    ease: config.ease || EASING.EASE_IN,
  });

  manager.addAnimation(tl);
  return tl;
};

// Scale animations
export const scaleIn = (
  element: string | Element | Element[],
  config: AnimationConfig = {}
): gsap.core.Timeline => {
  const manager = AnimationManager.getInstance();
  
  if (!manager.shouldAnimate()) {
    gsap.set(element, { scale: 1, opacity: 1 });
    return gsap.timeline();
  }

  const tl = gsap.timeline({
    onComplete: config.onComplete,
    onStart: config.onStart,
  });

  tl.fromTo(element,
    { scale: 0.8, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: config.duration || DURATION.NORMAL,
      delay: config.delay || 0,
      ease: config.ease || EASING.BOUNCE_OUT,
    }
  );

  manager.addAnimation(tl);
  return tl;
};

// Staggered animations
export const staggerFadeIn = (
  elements: string | Element[],
  config: StaggerConfig = {}
): gsap.core.Timeline => {
  const manager = AnimationManager.getInstance();
  
  if (!manager.shouldAnimate()) {
    gsap.set(elements, { opacity: 1 });
    return gsap.timeline();
  }

  const tl = gsap.timeline({
    onComplete: config.onComplete,
    onStart: config.onStart,
  });

  tl.fromTo(elements,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: config.duration || DURATION.NORMAL,
      delay: config.delay || 0,
      ease: config.ease || EASING.EASE_OUT,
      stagger: {
        amount: config.amount || config.stagger || STAGGER.NORMAL,
        from: config.from || 'start',
      },
    }
  );

  manager.addAnimation(tl);
  return tl;
};

// Height transition for dropdowns
export const expandHeight = (
  element: string | Element,
  config: AnimationConfig = {}
): gsap.core.Timeline => {
  const manager = AnimationManager.getInstance();
  
  if (!manager.shouldAnimate()) {
    gsap.set(element, { height: 'auto' });
    return gsap.timeline();
  }

  const tl = gsap.timeline({
    onComplete: config.onComplete,
    onStart: config.onStart,
  });

  tl.fromTo(element,
    { height: 0, opacity: 0 },
    {
      height: 'auto',
      opacity: 1,
      duration: config.duration || DURATION.SLOW,
      delay: config.delay || 0,
      ease: config.ease || EASING.EXPO_OUT,
    }
  );

  manager.addAnimation(tl);
  return tl;
};

export const collapseHeight = (
  element: string | Element,
  config: AnimationConfig = {}
): gsap.core.Timeline => {
  const manager = AnimationManager.getInstance();
  
  if (!manager.shouldAnimate()) {
    gsap.set(element, { height: 0, opacity: 0 });
    return gsap.timeline();
  }

  const tl = gsap.timeline({
    onComplete: config.onComplete,
    onStart: config.onStart,
  });

  tl.to(element, {
    height: 0,
    opacity: 0,
    duration: config.duration || DURATION.NORMAL,
    delay: config.delay || 0,
    ease: config.ease || EASING.EXPO_IN,
  });

  manager.addAnimation(tl);
  return tl;
};

// Hover effects
export const hoverScale = (
  element: string | Element,
  scale: number = 1.05
): void => {
  const manager = AnimationManager.getInstance();
  
  if (!manager.shouldAnimate()) return;

  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return;

  el.addEventListener('mouseenter', () => {
    gsap.to(el, {
      scale,
      duration: DURATION.FAST,
      ease: EASING.EASE_OUT,
    });
  });

  el.addEventListener('mouseleave', () => {
    gsap.to(el, {
      scale: 1,
      duration: DURATION.FAST,
      ease: EASING.EASE_OUT,
    });
  });
};

// Performance optimization utilities
export const setWillChange = (element: string | Element | Element[], properties: string): void => {
  gsap.set(element, { willChange: properties });
};

export const clearWillChange = (element: string | Element | Element[]): void => {
  gsap.set(element, { willChange: 'auto' });
};

// Export the animation manager instance
export const animationManager = AnimationManager.getInstance();
