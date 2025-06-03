// ThemeContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { catppuccin } from './theme/catppuccin';
import { getTheme, setTheme } from './database/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [variant, setVariant] = useState('mocha');
  const [theme, setThemeObj] = useState(catppuccin.mocha);

  useEffect(() => {
    const loadTheme = () => {
      const storedVariant = getTheme(); // from Realm
      setVariant(storedVariant);
      setThemeObj(catppuccin[storedVariant]);
    };
    loadTheme();
  }, []);

  const setThemeVariant = (newVariant) => {
    setVariant(newVariant);
    setThemeObj(catppuccin[newVariant]);
    setTheme(newVariant); // save to Realm
  };

  return (
    <ThemeContext.Provider value={{ theme, variant, setThemeVariant }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
