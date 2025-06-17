import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { useAppStore } from '../store/appStore';

interface ThemeContextType {
  currentTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const { preferences } = useAppStore();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // Detect system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Update theme based on preferences
  useEffect(() => {
    if (preferences?.theme) {
      switch (preferences.theme) {
        case 'dark':
          setCurrentTheme('dark');
          break;
        // case 'auto':
        //   setCurrentTheme(getSystemTheme());
        //   break;
        case 'light':
        default:
          setCurrentTheme('light');
          break;
      }
    }
  }, [preferences?.theme]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    // Auto theme support disabled for now
  }, [preferences?.theme]);

  const toggleTheme = () => {
    setCurrentTheme(current => current === 'light' ? 'dark' : 'light');
  };

  const isHighContrast = preferences?.enable_high_contrast || false;

  const theme = createTheme({
    palette: {
      mode: currentTheme,
      primary: {
        main: isHighContrast 
          ? (currentTheme === 'dark' ? '#ffffff' : '#000000')
          : (currentTheme === 'dark' ? '#90caf9' : '#1976d2'),
      },
      secondary: {
        main: isHighContrast 
          ? (currentTheme === 'dark' ? '#ffffff' : '#000000')
          : (currentTheme === 'dark' ? '#f48fb1' : '#dc004e'),
      },
      background: {
        default: isHighContrast
          ? (currentTheme === 'dark' ? '#000000' : '#ffffff')
          : (currentTheme === 'dark' ? '#121212' : '#fafafa'),
        paper: isHighContrast
          ? (currentTheme === 'dark' ? '#000000' : '#ffffff')
          : (currentTheme === 'dark' ? '#1e1e1e' : '#ffffff'),
      },
      text: {
        primary: isHighContrast
          ? (currentTheme === 'dark' ? '#ffffff' : '#000000')
          : (currentTheme === 'dark' ? '#ffffff' : '#000000'),
        secondary: isHighContrast
          ? (currentTheme === 'dark' ? '#cccccc' : '#333333')
          : (currentTheme === 'dark' ? '#b3b3b3' : '#666666'),
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: currentTheme === 'dark' ? '#6b6b6b #2b2b2b' : '#c1c1c1 #ffffff',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              backgroundColor: currentTheme === 'dark' ? '#2b2b2b' : '#ffffff',
              width: 8,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: currentTheme === 'dark' ? '#6b6b6b' : '#c1c1c1',
              minHeight: 24,
            },
            '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
              backgroundColor: currentTheme === 'dark' ? '#959595' : '#a8a8a8',
            },
            '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
              backgroundColor: currentTheme === 'dark' ? '#959595' : '#a8a8a8',
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: currentTheme === 'dark' ? '#959595' : '#a8a8a8',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: currentTheme === 'dark' 
              ? '0 2px 8px rgba(0,0,0,0.4)' 
              : '0 2px 8px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ currentTheme, toggleTheme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};