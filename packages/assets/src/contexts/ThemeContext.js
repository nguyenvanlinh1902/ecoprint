import React, { createContext, useState, useEffect, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createCustomTheme, lightTheme, darkTheme } from '../theme';

/**
 * Theme context for managing application themes
 */
const ThemeContext = createContext();

/**
 * Theme provider component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Provider component
 */
export const ThemeProvider = ({ children }) => {
  // Get stored theme preferences from localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedMode = localStorage.getItem('darkMode');
    return storedMode ? JSON.parse(storedMode) : false;
  });
  
  // Get user custom colors from localStorage
  const [customColors, setCustomColors] = useState(() => {
    try {
      const storedColors = localStorage.getItem('themeColors');
      return storedColors ? JSON.parse(storedColors) : {
        primary: null,
        secondary: null
      };
    } catch (error) {
      console.error('Error loading custom colors', error);
      return { primary: null, secondary: null };
    }
  });
  
  // Create theme based on preferences
  const [theme, setTheme] = useState(() => 
    createCustomTheme(customColors, isDarkMode)
  );
  
  // Update theme when preferences change
  useEffect(() => {
    const newTheme = createCustomTheme(customColors, isDarkMode);
    setTheme(newTheme);
    
    // Store preferences in localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    localStorage.setItem('themeColors', JSON.stringify(customColors));
  }, [isDarkMode, customColors]);
  
  /**
   * Toggle between light and dark mode
   */
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };
  
  /**
   * Update custom theme colors
   * @param {Object} colors - New color values
   */
  const updateColors = (colors) => {
    setCustomColors(prevColors => ({
      ...prevColors,
      ...colors
    }));
  };
  
  /**
   * Reset theme to default settings
   */
  const resetTheme = () => {
    setIsDarkMode(false);
    setCustomColors({
      primary: null,
      secondary: null
    });
  };
  
  const value = {
    theme,
    isDarkMode,
    customColors,
    toggleDarkMode,
    updateColors,
    resetTheme
  };
  
  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to use theme context
 * @returns {Object} Theme context value
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 