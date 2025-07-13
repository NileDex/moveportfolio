import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/useTheme"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'base' | 'lg'
}

export function ThemeToggle({ className, size = 'base' }: ThemeToggleProps) {
  const { toggleTheme, isDark } = useTheme()

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-12 h-6 p-0.5",
      toggle: "w-5 h-5",
      icon: "w-3 h-3"
    },
    base: {
      container: "w-16 h-8 p-1",
      toggle: "w-6 h-6",
      icon: "w-4 h-4"
    },
    lg: {
      container: "w-20 h-10 p-1.5",
      toggle: "w-7 h-7",
      icon: "w-5 h-5"
    }
  }

  const config = sizeConfig[size]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex rounded-full cursor-pointer transition-all duration-300 ease-out",
            config.container,
            // Cyberpunk color palette styling
            isDark
              ? "bg-[hsl(var(--cyber-surface-2))] border border-[hsl(var(--cyber-border-subtle))]"
              : "bg-[hsl(var(--background))] border border-[hsl(var(--border))]",
            // Hover effects
            "hover:border-[hsl(var(--cyber-glow))] hover:shadow-sm",
            // Focus states for accessibility
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--cyber-glow))] focus-visible:ring-offset-2",
            className
          )}
          onClick={toggleTheme}
          role="button"
          tabIndex={0}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleTheme()
            }
          }}
        >
      <div className="flex justify-between items-center w-full relative">
        {/* Active toggle indicator */}
        <div
          className={cn(
            "flex justify-center items-center rounded-full transition-all duration-300 ease-out",
            config.toggle,
            // Position and styling based on theme - Light on LEFT, Dark on RIGHT
            isDark
              ? `transform ${size === 'sm' ? 'translate-x-6' : size === 'base' ? 'translate-x-8' : 'translate-x-10'} bg-[hsl(var(--cyber-glow))] shadow-sm`
              : "transform translate-x-0 bg-[hsl(var(--primary))] shadow-sm",
            // Smooth animation
            "shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
          )}
        >
          {isDark ? (
            <Moon
              className={cn(config.icon, "text-[hsl(var(--primary-foreground))]")}
              strokeWidth={1.5}
            />
          ) : (
            <Sun
              className={cn(config.icon, "text-[hsl(var(--primary-foreground))]")}
              strokeWidth={1.5}
            />
          )}
        </div>

        {/* Inactive icon (background) */}
        <div
          className={cn(
            "flex justify-center items-center rounded-full transition-all duration-300 absolute",
            config.toggle,
            // Position opposite to active toggle - Light on LEFT, Dark on RIGHT
            isDark
              ? "left-0 transform translate-x-0"
              : `right-0 transform ${size === 'sm' ? 'translate-x-0' : 'translate-x-0'}`,
            // Subtle styling for inactive state
            "opacity-40"
          )}
        >
          {isDark ? (
            <Sun
              className={cn(config.icon, "text-[hsl(var(--cyber-text-dim))]")}
              strokeWidth={1.5}
            />
          ) : (
            <Moon
              className={cn(config.icon, "text-[hsl(var(--muted-foreground))]")}
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={16}
        className="bg-card text-card-foreground border border-border shadow-lg"
      >
        Toggle light/dark theme
      </TooltipContent>
    </Tooltip>
  )
}