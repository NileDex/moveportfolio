/**
 * Layout Components Index
 * Exports all layout-related components for the new header-based navigation system
 */

// Main Layout Components
export { default as AppHeader } from './AppHeader';
export { default as MainLayout } from './MainLayout';
export { default as NavigationMenu } from './NavigationMenu';
export { default as UserControls } from './UserControls';
export { default as MobileMenu } from './MobileMenu';
export { default as Breadcrumbs } from './Breadcrumbs';

// Export types
export type { AppHeaderProps } from './AppHeader';
export type { MainLayoutProps } from './MainLayout';
export type { NavigationMenuProps, NavigationItem } from './NavigationMenu';
export type { UserControlsProps } from './UserControls';
export type { MobileMenuProps } from './MobileMenu';
export type { BreadcrumbsProps, BreadcrumbItem } from './Breadcrumbs';

// Export navigation items configuration
export { navigationItems } from './NavigationMenu';
