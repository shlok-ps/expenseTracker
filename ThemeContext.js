import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from './themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('latte');
  const [theme, setTheme] = useState(themes['latte']);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedThemeName = await AsyncStorage.getItem('themeName');
        if (storedThemeName && themes[storedThemeName]) {
          setThemeName(storedThemeName);
          setTheme(themes[storedThemeName]);
        }
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem('themeName', themeName);
      } catch (error) {
        console.error('Failed to save theme to storage:', error);
      }
    };
    saveTheme();
  }, [themeName]);

  const changeTheme = (newThemeName) => {
    if (themes[newThemeName]) {
      setThemeName(newThemeName);
      setTheme(themes[newThemeName]);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
