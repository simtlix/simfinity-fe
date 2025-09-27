"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'auto';
export type CustomTheme = 'default' | 'blue' | 'green' | 'purple' | 'orange';

export interface ThemeContextType {
  mode: ThemeMode;
  customTheme: CustomTheme;
  setMode: (mode: ThemeMode) => void;
  setCustomTheme: (theme: CustomTheme) => void;
  theme: Theme;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme definitions
const themeDefinitions: Record<CustomTheme, ThemeOptions> = {
  default: {
    palette: {
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        main: '#dc004e',
        light: '#ff5983',
        dark: '#9a0036',
      },
    },
  },
  blue: {
    palette: {
      primary: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
      },
      secondary: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
    },
  },
  green: {
    palette: {
      primary: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
      },
      secondary: {
        main: '#ff5722',
        light: '#ff8a65',
        dark: '#d84315',
      },
    },
  },
  purple: {
    palette: {
      primary: {
        main: '#9c27b0',
        light: '#ba68c8',
        dark: '#7b1fa2',
      },
      secondary: {
        main: '#ffc107',
        light: '#ffd54f',
        dark: '#ff8f00',
      },
    },
  },
  orange: {
    palette: {
      primary: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
      secondary: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
      },
    },
  },
};

// Theme provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [customTheme, setCustomThemeState] = useState<CustomTheme>('default');

  // Load theme preferences from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    const savedCustomTheme = localStorage.getItem('theme-custom') as CustomTheme;
    
    if (savedMode) {
      setModeState(savedMode);
    }
    if (savedCustomTheme) {
      setCustomThemeState(savedCustomTheme);
    }
  }, []);

  // Determine actual theme mode (handles 'auto' mode)
  const actualMode = React.useMemo(() => {
    if (mode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
  }, [mode]);

  // Create theme based on current settings
  const theme = React.useMemo(() => {
    const baseTheme = themeDefinitions[customTheme];
    return createTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        mode: actualMode,
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              transition: 'background-color 0.3s ease, color 0.3s ease',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              transition: 'background-color 0.3s ease, color 0.3s ease',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              transition: 'background-color 0.3s ease, color 0.3s ease',
            },
          },
        },
      },
    });
  }, [actualMode, customTheme]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        // Force re-render by updating state
        setModeState(prev => prev);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [mode]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  const setCustomTheme = (newTheme: CustomTheme) => {
    setCustomThemeState(newTheme);
    localStorage.setItem('theme-custom', newTheme);
  };

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  };

  const value: ThemeContextType = {
    mode,
    customTheme,
    setMode,
    setCustomTheme,
    theme,
    toggleMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
