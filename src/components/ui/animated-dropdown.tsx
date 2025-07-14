import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useConditionalAnimation } from '@/contexts/AnimationContext';
import { 
  expandHeight, 
  collapseHeight, 
  staggerFadeIn, 
  fadeOut,
  hoverScale,
  DURATION, 
  EASING 
} from '@/lib/animations';
import { cn } from '@/lib/utils';

// Dropdown item interface
export interface DropdownItem {
  id: string;
  label: string;
  value: any;
  icon?: ReactNode;
  disabled?: boolean;
  description?: string;
}

// Animated dropdown props
interface AnimatedDropdownProps {
  items: DropdownItem[];
  value?: any;
  placeholder?: string;
  onSelect: (item: DropdownItem) => void;
  className?: string;
  disabled?: boolean;
  maxHeight?: number;
  searchable?: boolean;
  multiSelect?: boolean;
  selectedItems?: any[];
  onMultiSelect?: (items: any[]) => void;
}

// Animated dropdown component
export const AnimatedDropdown: React.FC<AnimatedDropdownProps> = ({
  items,
  value,
  placeholder = 'Select an option...',
  onSelect,
  className,
  disabled = false,
  maxHeight = 200,
  searchable = false,
  multiSelect = false,
  selectedItems = [],
  onMultiSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  // Refs for animation
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  
  const { shouldAnimate, shouldUseStagger } = useConditionalAnimation();

  // Filter items based on search
  const filteredItems = searchable 
    ? items.filter(item => 
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items;

  // Get selected item for display
  const selectedItem = items.find(item => item.value === value);

  // Handle dropdown toggle
  const toggleDropdown = async () => {
    if (disabled) return;

    if (isOpen) {
      // Close dropdown
      if (shouldAnimate && dropdownRef.current) {
        await new Promise<void>(resolve => {
          fadeOut(itemsRef.current!, {
            duration: DURATION.FAST,
            onComplete: resolve,
          });
        });
        
        collapseHeight(dropdownRef.current, {
          duration: DURATION.NORMAL,
          ease: EASING.EXPO_IN,
        });
      }
      setIsOpen(false);
      setSearchTerm('');
      setFocusedIndex(-1);
    } else {
      // Open dropdown
      setIsOpen(true);
      
      if (shouldAnimate && dropdownRef.current) {
        expandHeight(dropdownRef.current, {
          duration: DURATION.SLOW,
          ease: EASING.EXPO_OUT,
          onComplete: () => {
            // Animate items with stagger
            if (shouldUseStagger && itemsRef.current) {
              const itemElements = itemsRef.current.querySelectorAll('[data-dropdown-item]');
              staggerFadeIn(Array.from(itemElements), {
                duration: DURATION.NORMAL,
                stagger: 0.03,
                ease: EASING.EASE_OUT,
              });
            }
            
            // Focus search input if searchable
            if (searchable && searchRef.current) {
              searchRef.current.focus();
            }
          },
        });
      }
    }
  };

  // Handle item selection
  const handleItemSelect = (item: DropdownItem) => {
    if (item.disabled) return;

    if (multiSelect && onMultiSelect) {
      const isSelected = selectedItems.includes(item.value);
      const newSelection = isSelected
        ? selectedItems.filter(val => val !== item.value)
        : [...selectedItems, item.value];
      onMultiSelect(newSelection);
    } else {
      onSelect(item);
      toggleDropdown();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          e.preventDefault();
          toggleDropdown();
        } else if (focusedIndex >= 0 && focusedIndex < filteredItems.length) {
          e.preventDefault();
          handleItemSelect(filteredItems[focusedIndex]);
        }
        break;
      
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          toggleDropdown();
          triggerRef.current?.focus();
        }
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          toggleDropdown();
        } else {
          setFocusedIndex(prev => 
            prev < filteredItems.length - 1 ? prev + 1 : 0
          );
        }
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredItems.length - 1
          );
        }
        break;
    }
  };

  // Setup hover effects
  useEffect(() => {
    if (shouldAnimate && triggerRef.current) {
      hoverScale(triggerRef.current, 1.02);
    }
  }, [shouldAnimate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        if (isOpen) {
          toggleDropdown();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 text-left',
          'bg-gray-800 border border-gray-700 rounded-lg',
          'text-white hover:border-[#BDAB4C] focus:border-[#BDAB4C] focus:outline-none',
          'transition-colors duration-200',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'border-[#BDAB4C]'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={placeholder}
      >
        <span className={cn(
          'truncate',
          !selectedItem && 'text-gray-400'
        )}>
          {selectedItem ? selectedItem.label : placeholder}
        </span>
        
        <ChevronDown 
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute top-full left-0 right-0 z-50 mt-1',
            'bg-gray-800 border border-gray-700 rounded-lg shadow-lg',
            'overflow-hidden'
          )}
          style={{ maxHeight: shouldAnimate ? 0 : maxHeight }}
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-700">
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className={cn(
                  'w-full px-3 py-2 text-sm',
                  'bg-gray-900 border border-gray-600 rounded',
                  'text-white placeholder-gray-400',
                  'focus:border-[#BDAB4C] focus:outline-none'
                )}
              />
            </div>
          )}

          {/* Items Container */}
          <div
            ref={itemsRef}
            className="max-h-48 overflow-y-auto"
            role="listbox"
            aria-multiselectable={multiSelect}
          >
            {filteredItems.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                No items found
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = multiSelect 
                  ? selectedItems.includes(item.value)
                  : item.value === value;
                const isFocused = index === focusedIndex;

                return (
                  <div
                    key={item.id}
                    data-dropdown-item
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      'px-4 py-3 cursor-pointer flex items-center gap-3',
                      'hover:bg-gray-700 transition-colors duration-150',
                      isSelected && 'bg-[#BDAB4C]/20 text-[#BDAB4C]',
                      isFocused && 'bg-gray-700',
                      item.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={() => handleItemSelect(item)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    {item.icon && (
                      <span className="flex-shrink-0">
                        {item.icon}
                      </span>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {item.label}
                      </div>
                      {item.description && (
                        <div className="text-xs text-gray-400 truncate">
                          {item.description}
                        </div>
                      )}
                    </div>

                    {multiSelect && (
                      <div className={cn(
                        'w-4 h-4 border rounded flex-shrink-0',
                        isSelected 
                          ? 'bg-[#BDAB4C] border-[#BDAB4C]' 
                          : 'border-gray-500'
                      )}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-black m-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Simple animated select component for basic use cases
export const AnimatedSelect: React.FC<{
  options: { label: string; value: any }[];
  value?: any;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
}> = ({ options, value, onChange, placeholder = 'Select...', className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { shouldAnimate } = useConditionalAnimation();

  const selectedOption = options.find(opt => opt.value === value);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);

    if (!isOpen && shouldAnimate && dropdownRef.current) {
      expandHeight(dropdownRef.current, {
        duration: DURATION.NORMAL,
        ease: EASING.EXPO_OUT,
      });
    }
  };

  const handleSelect = (option: { label: string; value: any }) => {
    onChange(option.value);
    setIsOpen(false);

    if (shouldAnimate && dropdownRef.current) {
      collapseHeight(dropdownRef.current, {
        duration: DURATION.FAST,
        ease: EASING.EXPO_IN,
      });
    }
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2',
          'bg-gray-800 border border-gray-700 rounded text-white',
          'hover:border-[#BDAB4C] focus:border-[#BDAB4C] focus:outline-none',
          'transition-colors duration-200'
        )}
      >
        <span className={!selectedOption ? 'text-gray-400' : ''}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute top-full left-0 right-0 z-50 mt-1',
            'bg-gray-800 border border-gray-700 rounded shadow-lg',
            'overflow-hidden'
          )}
          style={{ height: shouldAnimate ? 0 : 'auto' }}
        >
          <div className="max-h-48 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  'w-full px-3 py-2 text-left hover:bg-gray-700',
                  'transition-colors duration-150',
                  option.value === value && 'bg-[#BDAB4C]/20 text-[#BDAB4C]'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedDropdown;
