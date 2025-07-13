import React from 'react';
import { useWallet } from '@razorlabs/razorkit';
import {
  FaUserCircle,
  FaChevronDown,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';

import { cn } from '../../lib/utils';

export interface UserControlsProps {
  userMenuOpen: boolean;
  onUserMenuToggle: () => void;
  className?: string;
}

/**
 * UserControls Component
 * Simplified user account menu for header
 * Clean design with minimal features
 */
const UserControls: React.FC<UserControlsProps> = ({
  userMenuOpen,
  onUserMenuToggle,
  className
}) => {
  const { disconnect } = useWallet();

  // Handle disconnect wallet
  const handleDisconnect = () => {
    disconnect();
    onUserMenuToggle(); // Close menu after disconnect
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-2">
        {/* User Menu - Simple Account Button */}
        <div className="relative">
          <button
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none',
              { 'bg-accent text-accent-foreground': userMenuOpen }
            )}
            onClick={onUserMenuToggle}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <FaUserCircle className="h-4 w-4" />
            <span>Account</span>
            <FaChevronDown
              className={cn('h-3 w-3 transition-transform duration-200', {
                'rotate-180': userMenuOpen
              })}
            />
          </button>

          {/* Simple User Menu Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
              <div className="space-y-1">
                <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none">
                  <FaCog className="h-4 w-4" />
                  <span>Settings</span>
                </button>

                <button
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground focus:outline-none"
                  onClick={handleDisconnect}
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserControls;
