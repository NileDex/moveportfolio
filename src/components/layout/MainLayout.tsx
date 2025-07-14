import React from 'react';
import AppHeader from './AppHeader';
import { cn } from '../../lib/utils';
import { useNavigationContext } from '../../contexts/NavigationContext';

export interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  spacing?: 'none' | 'sm' | 'base' | 'lg';
}

/**
 * MainLayout Component
 * Main application layout wrapper with header and content area
 * Replaces the old sidebar-based layout with header-based navigation
 */
const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className,
  containerSize = 'xl',
  spacing = 'base'
}) => {
  const { currentRoute } = useNavigationContext();

  // Don't render layout wrapper for portfolio page (landing page)
  if (currentRoute === '/portfolio') {
    return <>{children}</>;
  }

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
