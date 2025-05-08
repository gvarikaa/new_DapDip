import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Theme types
export type ThemeMode = "light" | "dark" | "dusk" | "system";

export interface Theme {
  name: string;
  mode: ThemeMode;
  primaryColor: string;
  secondaryColor?: string;
  fontFamily?: string;
}

// Predefined theme configurations
export const PRESET_THEMES: Record<string, Theme> = {
  light: {
    name: "Light",
    mode: "light",
    primaryColor: "#0070f3", // Blue
  },
  dark: {
    name: "Dark",
    mode: "dark",
    primaryColor: "#3b82f6", // Sky blue
  },
  dusk: {
    name: "Dusk",
    mode: "dusk",
    primaryColor: "#8b5cf6", // Purple
  },
  ocean: {
    name: "Ocean",
    mode: "dark",
    primaryColor: "#06b6d4", // Cyan
    secondaryColor: "#0284c7", // Sky
  },
  forest: {
    name: "Forest",
    mode: "light",
    primaryColor: "#16a34a", // Green
    secondaryColor: "#65a30d", // Lime
  },
  sunset: {
    name: "Sunset",
    mode: "dusk",
    primaryColor: "#f59e0b", // Amber
    secondaryColor: "#ef4444", // Red
  },
  midnight: {
    name: "Midnight",
    mode: "dark",
    primaryColor: "#6366f1", // Indigo
    secondaryColor: "#8b5cf6", // Violet
  },
  candy: {
    name: "Candy",
    mode: "light",
    primaryColor: "#ec4899", // Pink
    secondaryColor: "#8b5cf6", // Violet
  },
};

// CSS variable names
export const THEME_VARIABLES = {
  primaryColor: "--primary",
  primaryForeground: "--primary-foreground",
  secondaryColor: "--secondary",
  secondaryForeground: "--secondary-foreground",
};

// Helper to generate CSS variables for a theme
export function generateThemeCSS(theme: Theme): Record<string, string> {
  const cssVars: Record<string, string> = {};
  
  // Set primary color
  if (theme.primaryColor) {
    cssVars[THEME_VARIABLES.primaryColor] = theme.primaryColor;
    // Generate a complementary foreground color for contrast
    cssVars[THEME_VARIABLES.primaryForeground] = getContrastColor(theme.primaryColor);
  }
  
  // Set secondary color if provided
  if (theme.secondaryColor) {
    cssVars[THEME_VARIABLES.secondaryColor] = theme.secondaryColor;
    cssVars[THEME_VARIABLES.secondaryForeground] = getContrastColor(theme.secondaryColor);
  }
  
  return cssVars;
}

// Apply a theme to the document
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const cssVars = generateThemeCSS(theme);
  
  // Apply theme mode class
  if (theme.mode === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light', 'dusk');
  } else if (theme.mode === 'dusk') {
    root.classList.add('dusk');
    root.classList.remove('light', 'dark');
  } else {
    root.classList.add('light');
    root.classList.remove('dark', 'dusk');
  }
  
  // Apply CSS variables
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Apply font family if specified
  if (theme.fontFamily) {
    root.style.setProperty("--font-sans", theme.fontFamily);
  }
}

// Helper to determine if a color is dark
export function isColorDark(color: string): boolean {
  // Convert hex to RGB
  let r = 0, g = 0, b = 0;
  
  if (color.startsWith('#')) {
    if (color.length === 4) {
      r = parseInt(color[1] + color[1], 16);
      g = parseInt(color[2] + color[2], 16);
      b = parseInt(color[3] + color[3], 16);
    } else if (color.length === 7) {
      r = parseInt(color.substring(1, 3), 16);
      g = parseInt(color.substring(3, 5), 16);
      b = parseInt(color.substring(5, 7), 16);
    }
  }
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if the color is dark
  return luminance < 0.5;
}

// Helper to get a contrasting color (black or white)
export function getContrastColor(color: string): string {
  return isColorDark(color) ? 'white' : 'black';
}

// Helper to get a system preference
export function getSystemThemePreference(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

// Function to merge classes with tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}