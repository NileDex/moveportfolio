import React, { useRef, useState } from 'react';
import { useAnimation, useConditionalAnimation } from '@/contexts/AnimationContext';
import { 
  fadeIn, 
  fadeOut, 
  slideUp, 
  slideDown, 
  scaleIn, 
  staggerFadeIn, 
  expandHeight, 
  collapseHeight,
  hoverScale 
} from '@/lib/animations';
import { AnimatedDropdown, AnimatedSelect } from '@/components/ui/animated-dropdown';
import { Button } from '@/components/ui/button';

export default function AnimationDemo() {
  const { 
    isAnimationEnabled, 
    toggleAnimations, 
    performanceMode, 
    setPerformanceMode,
    frameRate,
    isLowPerformance,
    announceToScreenReader 
  } = useAnimation();
  
  const { shouldAnimate, shouldUseStagger, shouldUseComplexAnimations } = useConditionalAnimation();

  // Demo refs
  const fadeRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const staggerRef = useRef<HTMLDivElement>(null);
  const expandRef = useRef<HTMLDivElement>(null);

  // Demo state
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);

  // Demo data
  const dropdownOptions = [
    { value: 'option1', label: 'Fade In Animation' },
    { value: 'option2', label: 'Slide Up Animation' },
    { value: 'option3', label: 'Scale In Animation' },
    { value: 'option4', label: 'Stagger Animation' },
    { value: 'option5', label: 'Complex Animation' },
  ];

  // Animation handlers
  const handleFadeIn = () => {
    if (fadeRef.current && shouldAnimate) {
      fadeIn(fadeRef.current);
      announceToScreenReader('Fade in animation triggered');
    }
  };

  const handleFadeOut = () => {
    if (fadeRef.current && shouldAnimate) {
      fadeOut(fadeRef.current);
      announceToScreenReader('Fade out animation triggered');
    }
  };

  const handleSlideUp = () => {
    if (slideRef.current && shouldAnimate) {
      slideUp(slideRef.current);
      announceToScreenReader('Slide up animation triggered');
    }
  };

  const handleSlideDown = () => {
    if (slideRef.current && shouldAnimate) {
      slideDown(slideRef.current);
      announceToScreenReader('Slide down animation triggered');
    }
  };

  const handleScaleIn = () => {
    if (scaleRef.current && shouldAnimate) {
      scaleIn(scaleRef.current);
      announceToScreenReader('Scale in animation triggered');
    }
  };

  const handleStaggerAnimation = () => {
    if (staggerRef.current && shouldAnimate && shouldUseStagger) {
      const items = staggerRef.current.querySelectorAll('.stagger-item');
      staggerFadeIn(Array.from(items));
      announceToScreenReader('Stagger animation triggered');
    }
  };

  const handleExpandCollapse = () => {
    if (expandRef.current && shouldAnimate) {
      if (isExpanded) {
        collapseHeight(expandRef.current);
        announceToScreenReader('Content collapsed');
      } else {
        expandHeight(expandRef.current);
        announceToScreenReader('Content expanded');
      }
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            GSAP Animation System Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Interactive demonstration of the animation system with performance monitoring
          </p>
        </div>

        {/* Animation Controls */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Animation Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Animation Status</label>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={toggleAnimations}
                  variant={isAnimationEnabled ? "default" : "outline"}
                  size="sm"
                >
                  {isAnimationEnabled ? 'Enabled' : 'Disabled'}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {isAnimationEnabled ? 'Animations are active' : 'Animations are paused'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Performance Mode</label>
              <div className="flex gap-1">
                {(['high', 'balanced', 'low'] as const).map((mode) => (
                  <Button
                    key={mode}
                    onClick={() => setPerformanceMode(mode)}
                    variant={performanceMode === mode ? "default" : "outline"}
                    size="sm"
                    className="capitalize"
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Performance Metrics</label>
              <div className="text-sm space-y-1">
                <div>FPS: <span className="font-mono">{frameRate}</span></div>
                <div>Low Performance: <span className="font-mono">{isLowPerformance ? 'Yes' : 'No'}</span></div>
                <div>Complex Animations: <span className="font-mono">{shouldUseComplexAnimations ? 'Yes' : 'No'}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Animations */}
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-semibold">Basic Animations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fade Animation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Fade Animation</h3>
              <div 
                ref={fadeRef}
                className="h-24 bg-primary/20 border-2 border-primary rounded-lg flex items-center justify-center"
              >
                <span className="text-primary font-medium">Fade Target</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleFadeIn} size="sm">Fade In</Button>
                <Button onClick={handleFadeOut} size="sm" variant="outline">Fade Out</Button>
              </div>
            </div>

            {/* Slide Animation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Slide Animation</h3>
              <div 
                ref={slideRef}
                className="h-24 bg-secondary/20 border-2 border-secondary rounded-lg flex items-center justify-center"
              >
                <span className="text-secondary-foreground font-medium">Slide Target</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSlideUp} size="sm">Slide Up</Button>
                <Button onClick={handleSlideDown} size="sm" variant="outline">Slide Down</Button>
              </div>
            </div>

            {/* Scale Animation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Scale Animation</h3>
              <div 
                ref={scaleRef}
                className="h-24 bg-accent/20 border-2 border-accent rounded-lg flex items-center justify-center cursor-pointer"
                onMouseEnter={() => hoverScale(scaleRef.current)}
              >
                <span className="text-accent-foreground font-medium">Scale Target</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleScaleIn} size="sm">Scale In</Button>
                <span className="text-sm text-muted-foreground">Hover for scale effect</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Animations */}
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-semibold">Advanced Animations</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stagger Animation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Stagger Animation</h3>
              <div ref={staggerRef} className="space-y-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div 
                    key={num}
                    className="stagger-item h-12 bg-muted border rounded-lg flex items-center justify-center opacity-0"
                  >
                    <span className="font-medium">Item {num}</span>
                  </div>
                ))}
              </div>
              <Button onClick={handleStaggerAnimation} size="sm">
                Trigger Stagger
              </Button>
            </div>

            {/* Expand/Collapse Animation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Expand/Collapse Animation</h3>
              <div 
                ref={expandRef}
                className="bg-muted border rounded-lg overflow-hidden"
                style={{ height: isExpanded ? 'auto' : '60px' }}
              >
                <div className="p-4">
                  <p className="font-medium mb-2">Expandable Content</p>
                  <p className="text-sm text-muted-foreground">
                    This content can be expanded and collapsed with smooth height animations.
                    The animation respects the user's motion preferences and performance settings.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Additional content that becomes visible when expanded.
                    This demonstrates the expandHeight and collapseHeight animation functions.
                  </p>
                </div>
              </div>
              <Button onClick={handleExpandCollapse} size="sm">
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
            </div>
          </div>
        </div>

        {/* Animated Components */}
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-semibold">Animated Components</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Animated Select */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Animated Select</h3>
              <AnimatedSelect
                options={dropdownOptions}
                value={selectedValue}
                onChange={setSelectedValue}
                placeholder="Choose an animation..."
              />
              <p className="text-sm text-muted-foreground">
                Selected: {selectedValue || 'None'}
              </p>
            </div>

            {/* Animated Multi-Select Dropdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Animated Multi-Select</h3>
              <AnimatedDropdown
                options={dropdownOptions}
                value={multiSelectValues}
                onChange={setMultiSelectValues}
                placeholder="Choose multiple animations..."
                multiple
                searchable
              />
              <p className="text-sm text-muted-foreground">
                Selected: {multiSelectValues.length > 0 ? multiSelectValues.join(', ') : 'None'}
              </p>
            </div>
          </div>
        </div>

        {/* Animation Status */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Animation Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Should Animate:</span>
              <span className={`ml-2 ${shouldAnimate ? 'text-green-600' : 'text-red-600'}`}>
                {shouldAnimate ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">Use Stagger:</span>
              <span className={`ml-2 ${shouldUseStagger ? 'text-green-600' : 'text-red-600'}`}>
                {shouldUseStagger ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">Complex Animations:</span>
              <span className={`ml-2 ${shouldUseComplexAnimations ? 'text-green-600' : 'text-red-600'}`}>
                {shouldUseComplexAnimations ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">Performance Mode:</span>
              <span className="ml-2 capitalize font-mono">{performanceMode}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
