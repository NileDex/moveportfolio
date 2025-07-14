import React from 'react';
import { useWallet, useAccount } from '@razorlabs/razorkit';
import {
  FaTimes,
  FaCog,
  FaSignOutAlt,
  FaWallet,
  FaTwitter,
  FaDiscord,
  FaTelegram,
  FaGithub,
  FaLinkedin
} from 'react-icons/fa';
import { Button } from '../ui/button';
import { useNavigationContext } from '../../contexts/NavigationContext';
import NavigationMenu from './NavigationMenu';
import TokenLogo from '../../assets/TokenLogo.png';

export interface MobileMenuProps {
  currentRoute?: string; // Made optional since we can get from context
  onNavigate?: (route: string) => void; // Made optional since we can use context navigation
  onClose: () => void;
  isWalletConnected: boolean;
  className?: string;
}

/**
 * MobileMenu Component
 * Slide-out navigation menu for mobile devices
 * Includes navigation, user controls, and social links
 */
const MobileMenu: React.FC<MobileMenuProps> = ({
  currentRoute: propCurrentRoute,
  onNavigate: propOnNavigate,
  onClose,
  isWalletConnected,
  className
}) => {
  const { disconnect } = useWallet();
  const { address } = useAccount();

  // Use navigation context
  const {
    currentRoute: contextCurrentRoute,
    navigateWithState,
    preferences
  } = useNavigationContext();

  // Use props or context values
  const currentRoute = propCurrentRoute || contextCurrentRoute;
  const onNavigate = propOnNavigate || navigateWithState;

  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Handle navigation with menu close
  const handleNavigation = (route: string) => {
    onNavigate(route);
    onClose();
  };

  // Handle disconnect wallet
  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  // Social links configuration
  const socialLinks = [
    { 
      icon: FaTwitter, 
      url: "https://twitter.com/yourhandle", 
      label: "Twitter",
      color: "#1DA1F2"
    },
    { 
      icon: FaDiscord, 
      url: "https://discord.gg/yourserver", 
      label: "Discord",
      color: "#5865F2"
    },
    { 
      icon: FaTelegram, 
      url: "https://t.me/yourchannel", 
      label: "Telegram",
      color: "#0088CC"
    },
    { 
      icon: FaGithub, 
      url: "https://github.com/yourrepo", 
      label: "GitHub",
      color: "#333"
    },
    { 
      icon: FaLinkedin, 
      url: "https://linkedin.com/company/yourcompany", 
      label: "LinkedIn",
      color: "#0077B5"
    }
  ];

  return (
    <div className={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden ${className || ''}`}>
      <div className="fixed inset-y-0 left-0 z-50 h-full w-3/4 border-r bg-background p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={TokenLogo}
              alt="Metacoms Logo"
              className="h-8 w-8"
            />
            <span className="font-bold">Metacoms</span>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            aria-label="Close menu"
          >
            <FaTimes />
          </Button>
        </div>

        <div className="my-4 h-px bg-border" />

        {/* User Info (if connected) */}
        {isWalletConnected && address && (
          <>
            <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <FaWallet className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {formatAddress(address)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Connected
                </div>
              </div>
            </div>
            <div className="my-4 h-px bg-border" />
          </>
        )}

        {/* Navigation */}
        <div className="flex-1">
          <NavigationMenu
            onNavigate={handleNavigation}
            variant="vertical"
            showLabels={true}
            showFavorites={true}
          />
        </div>

        <div className="my-4 h-px bg-border" />

        {/* Actions */}
        <div className="space-y-2">
          {isWalletConnected ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // TODO: Navigate to settings
                  console.log('Open settings');
                  onClose();
                }}
                className="w-full justify-start"
              >
                <FaCog className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="w-full justify-start text-destructive hover:text-destructive"
              >
                <FaSignOutAlt className="mr-2 h-4 w-4" />
                Disconnect Wallet
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                // TODO: Implement wallet connection
                console.log('Connect wallet');
                onClose();
              }}
              className="w-full"
            >
              <FaWallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>

        {/* Social Links */}
        <div className="mt-6">
          <div className="h-px bg-border" />
          <div className="mt-4">
            <h4 className="text-sm font-medium text-muted-foreground">Follow Us</h4>
            <div className="mt-2 flex gap-3">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                    title={social.label}
                    style={{ color: social.color }}
                  >
                    <IconComponent className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <span>© 2025 Metacoms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
