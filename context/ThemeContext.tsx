import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'react-native';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getColors, ColorScheme } from '@/constants/colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  isDarkMode: boolean;
  colors: ColorScheme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextProps | null>(null);

// Custom Hook untuk akses theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context.colors;
}

// Hook untuk akses full theme context (termasuk toggle functions)
export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme(); // 'light' | 'dark' | null
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved preference saat app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update isDarkMode saat themeMode atau systemColorScheme berubah
  useEffect(() => {
    if (themeMode === 'system') {
      setIsDarkMode(systemColorScheme === 'dark');
    } else {
      setIsDarkMode(themeMode === 'dark');
    }
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedMode = await SecureStore.getItemAsync('theme_preference');
      if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
        setThemeMode(savedMode as ThemeMode);
      } else {
        // Default ke system jika belum ada preference
        setThemeMode('system');
      }
    } catch (error) {
      console.error('Gagal load theme preference:', error);
      setThemeMode('system');
    }
  };

  const setTheme = async (mode: ThemeMode) => {
    try {
      await SecureStore.setItemAsync('theme_preference', mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Gagal save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    // Toggle antara light dan dark (skip system)
    const newMode = isDarkMode ? 'light' : 'dark';
    setTheme(newMode);
  };

  const colors = getColors(isDarkMode);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        colors,
        themeMode,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

