import { createTheme } from '@mui/material/styles';

/**
 * Light theme configuration
 */
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

/**
 * Dark theme configuration
 */
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

/**
 * Create custom theme with user color preferences
 * @param {Object} customColors - User color preferences
 * @param {boolean} isDarkMode - Whether to use dark mode
 * @returns {Object} Custom theme object
 */
export const createCustomTheme = (customColors = {}, isDarkMode = false) => {
  const baseTheme = isDarkMode ? darkTheme : lightTheme;
  
  return createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      primary: {
        main: customColors.primary || baseTheme.palette.primary.main,
      },
      secondary: {
        main: customColors.secondary || baseTheme.palette.secondary.main,
      },
    },
  });
};

// Default export for backward compatibility
export const theme = lightTheme; 