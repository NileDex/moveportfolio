import React, { useState } from 'react';
import { useWallet } from '@razorlabs/razorkit';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { useNavigationContext } from '../../contexts/NavigationContext';
import MovePriceCard from '../MovePriceCard';
import SimpleDropdownMenu from './SimpleDropdownMenu';
import NetworkSelector, { Network, DEFAULT_NETWORKS } from '../NetworkSelector';
import { ThemeToggle } from '../ui/theme-toggle';
import UserControls from './UserControls';
import TokenLogo from '../../assets/TokenLogo.png';

export interface AppHeaderProps {
  className?: string;
}

/**
 * AppHeader Component - Clean Rebuild
 * Starting fresh with minimal components
 */
const AppHeader: React.FC<AppHeaderProps> = ({ className }) => {
  const { connected } = useWallet();
  const { currentRoute, navigateWithState } = useNavigationContext();

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Network state
  const [currentNetwork, setCurrentNetwork] = useState<Network>(DEFAULT_NETWORKS[0]);

  // User controls state
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNavigation = (route: string) => {
    navigateWithState(route);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNetworkChange = (network: Network) => {
    setCurrentNetwork(network);
    console.log('Network changed to:', network.displayName);
  };

  // Don't show header on portfolio page (landing page)
  if (currentRoute === '/portfolio') {
    return null;
  }

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className || ''}`}>
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4 relative">
        {/* Left Section - Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <Button
            onClick={toggleMobileMenu}
            variant="ghost"
            size="sm"
            className="md:hidden"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('/dashboard')}>
            <img
              src={TokenLogo}
              alt="Metacoms Logo"
              className="h-8 w-8"
            />
            <span className="hidden font-bold sm:inline-block">Metacoms</span>
          </div>

          {/* MOVE Price Card - Desktop Only */}
          <div className="hidden lg:block">
            <MovePriceCard />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <SimpleDropdownMenu />
          </div>
        </div>

        {/* Right Section - Network Selector and Connect Button */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Network Selector */}
          <NetworkSelector
            currentNetwork={currentNetwork}
            networks={DEFAULT_NETWORKS}
            onNetworkChange={handleNetworkChange}
            className="hidden sm:block"
          />

          {/* User Controls (when connected) */}
          {connected && (
            <UserControls
              userMenuOpen={userMenuOpen}
              onUserMenuToggle={() => setUserMenuOpen(!userMenuOpen)}
            />
          )}

          {/* Theme Toggle */}
          <ThemeToggle size="sm" />

          {/* Connect Wallet Button (when not connected) */}
          {!connected && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                // TODO: Implement wallet connection
                console.log('Connect wallet');
              }}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
