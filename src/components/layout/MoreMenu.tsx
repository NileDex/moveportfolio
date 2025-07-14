import React, { useState, useRef, useEffect } from 'react';
import { FaEllipsisH, FaChevronDown } from 'react-icons/fa';
import { cn } from '../../lib/utils';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { secondaryNavigationItems, NavigationItem } from './NavigationMenu';

export interface MoreMenuProps {
  className?: string;
}

/**
 * MoreMenu Component
 * Dropdown menu for secondary navigation items to reduce header clutter
 */
const MoreMenu: React.FC<MoreMenuProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { navigateWithState, isRouteActive } = useNavigationContext();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleItemClick = (item: NavigationItem) => {
    navigateWithState(item.route);
    setIsOpen(false);
  };

  // Check if any secondary item is active
  const hasActiveItem = secondaryNavigationItems.some(item => isRouteActive(item.route));

  return (
    <div
      className={cn('relative', className)}
      ref={dropdownRef}
    >
      {/* Trigger Button */}
      <button
        className={cn(
          'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none',
          {
            'bg-accent text-accent-foreground': isOpen || hasActiveItem
          }
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="More navigation options"
      >
        <span>More</span>
        <FaChevronDown
          className={cn('h-3 w-3 transition-transform duration-200', {
            'rotate-180': isOpen
          })}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <div className="space-y-1" role="menu">
            {secondaryNavigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isRouteActive(item.route);

              return (
                <button
                  key={item.id}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none',
                    {
                      'bg-accent text-accent-foreground': isActive,
                      'text-primary': item.premium
                    }
                  )}
                  onClick={() => handleItemClick(item)}
                  role="menuitem"
                >
                  {IconComponent && (
                    <IconComponent className="h-4 w-4" />
                  )}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.premium && (
                        <span className="rounded bg-primary px-1 py-0.5 text-xs text-primary-foreground">
                          PRO
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoreMenu;
