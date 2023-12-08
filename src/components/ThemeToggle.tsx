"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [mounted, setMounted] = useState(false);
  // Use resolvedTheme to take into account system theme settings
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Ensure component is mounted before rendering to access theme context
  useEffect(() => {
    setMounted(true);
  }, []);

  // Do not render until mounted
  if (!mounted) {
    return null;
  }

  // Helper function to determine if a theme is active
  const isThemeActive = (value: string) => theme === value || (!theme && resolvedTheme === value);

  return (
    <div className={className} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            {/* Determine icon based on resolvedTheme when theme is set to 'system' */}
            {(isThemeActive('light') || (isThemeActive('system') && resolvedTheme === 'light')) ? (
              <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Define the action for each theme option */}
          <DropdownMenuItem onClick={() => setTheme("light")} className={isThemeActive("light") ? "active-theme" : ""}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")} className={isThemeActive("dark") ? "active-theme" : ""}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")} className={isThemeActive("system") ? "active-theme" : ""}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
