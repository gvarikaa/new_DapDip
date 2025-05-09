'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/trpc/client';
import { PRESET_THEMES, Theme, ThemeMode, applyTheme, getSystemThemePreference } from '@/lib/themes';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setFontFamily: (font: string) => void;
  toggleAnimations: (enabled: boolean) => void;
  animationsEnabled: boolean;
  isLoading: boolean;
  presetThemes: Record<string, Theme>;
  applyPresetTheme: (themeKey: string) => void;
  saveThemePreferences: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: PRESET_THEMES.light,
  mode: 'system',
  setMode: () => {},
  setPrimaryColor: () => {},
  setSecondaryColor: () => {},
  setFontFamily: () => {},
  toggleAnimations: () => {},
  animationsEnabled: true,
  isLoading: false,
  presetThemes: PRESET_THEMES,
  applyPresetTheme: () => {},
  saveThemePreferences: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(PRESET_THEMES.light);
  const [mode, setMode] = useState<ThemeMode>('system');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user settings
  const { data: userSettings } = api.user.getSettings.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  
  // Update user theme settings mutation
  const updateSettingsMutation = api.user.updateThemeSettings.useMutation();
  
  // Initialize theme based on user settings or system preference
  useEffect(() => {
    if (userSettings) {
      const userMode = userSettings.theme as ThemeMode;
      const systemPreference = getSystemThemePreference();
      
      // Set theme mode
      let effectiveMode: ThemeMode = userMode;
      if (userMode === 'system') {
        effectiveMode = systemPreference === 'dark' ? 'dark' : 'light';
      }
      
      // Create theme object from user preferences
      const userTheme: Theme = {
        name: 'Custom',
        mode: effectiveMode,
        primaryColor: userSettings.primaryColor || PRESET_THEMES[effectiveMode].primaryColor,
        secondaryColor: userSettings.secondaryColor,
        fontFamily: userSettings.fontPreference,
      };
      
      setTheme(userTheme);
      setMode(userMode);
      setAnimationsEnabled(userSettings.animationsEnabled);
      applyTheme(userTheme);
      
      // Add or remove animations disabled class
      if (!userSettings.animationsEnabled) {
        document.documentElement.classList.add('no-animations');
      } else {
        document.documentElement.classList.remove('no-animations');
      }
      
      setIsLoading(false);
    } else {
      // No user settings, use system default
      const systemPreference = getSystemThemePreference();
      const defaultTheme = PRESET_THEMES[systemPreference];
      
      setTheme(defaultTheme);
      setMode('system');
      applyTheme(defaultTheme);
      setIsLoading(false);
    }
  }, [userSettings]);
  
  // Listen for system preference changes when using 'system' mode
  useEffect(() => {
    if (mode !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemMode = e.matches ? 'dark' : 'light';
      const newTheme = { ...theme, mode: newSystemMode };
      setTheme(newTheme);
      applyTheme(newTheme);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [mode, theme]);
  
  // Set theme mode
  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
    
    // If system, determine the effective mode
    let effectiveMode = newMode;
    if (newMode === 'system') {
      effectiveMode = getSystemThemePreference() === 'dark' ? 'dark' : 'light';
    }
    
    const newTheme = { ...theme, mode: effectiveMode };
    setTheme(newTheme);
    applyTheme(newTheme);
  };
  
  // Update primary color
  const handleSetPrimaryColor = (color: string) => {
    const newTheme = { ...theme, primaryColor: color };
    setTheme(newTheme);
    applyTheme(newTheme);
  };
  
  // Update secondary color
  const handleSetSecondaryColor = (color: string) => {
    const newTheme = { ...theme, secondaryColor: color };
    setTheme(newTheme);
    applyTheme(newTheme);
  };
  
  // Update font family
  const handleSetFontFamily = (font: string) => {
    const newTheme = { ...theme, fontFamily: font };
    setTheme(newTheme);
    applyTheme(newTheme);
  };
  
  // Toggle animations
  const handleToggleAnimations = (enabled: boolean) => {
    setAnimationsEnabled(enabled);
    
    if (!enabled) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }
  };
  
  // Apply a preset theme
  const handleApplyPresetTheme = (themeKey: string) => {
    if (!PRESET_THEMES[themeKey]) return;
    
    const presetTheme = PRESET_THEMES[themeKey];
    setTheme(presetTheme);
    setMode(presetTheme.mode);
    applyTheme(presetTheme);
  };
  
  // Save theme preferences to user settings
  const saveThemePreferences = () => {
    // Only save if we have user settings (user is logged in)
    if (!userSettings) return;
    
    // Use the specialized theme settings mutation
    updateSettingsMutation.mutate({
      theme: mode,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      fontPreference: theme.fontFamily,
      animationsEnabled,
    });
  };
  
  const value = {
    theme,
    mode,
    setMode: handleSetMode,
    setPrimaryColor: handleSetPrimaryColor,
    setSecondaryColor: handleSetSecondaryColor,
    setFontFamily: handleSetFontFamily,
    toggleAnimations: handleToggleAnimations,
    animationsEnabled,
    isLoading,
    presetThemes: PRESET_THEMES,
    applyPresetTheme: handleApplyPresetTheme,
    saveThemePreferences,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};