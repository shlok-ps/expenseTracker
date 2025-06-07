// ThemeContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { catppuccin, ITheme } from 'src/theme/catppuccin';
import { getThemeFromDB, setThemeToDB } from 'src/database/theme';

interface IThemeContext { theme: ITheme, variant: string, setThemeVariant: (newVariant: string) => void }

const ThemeContext = createContext<IThemeContext>({ theme: {} as any, variant: '', setThemeVariant: () => { } });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [variant, setVariant] = useState('mocha');
  const [theme, setThemeObj] = useState(catppuccin.mocha);

  useEffect(() => {
    const loadTheme = () => {
      const storedVariant = getThemeFromDB(); // from Realm
      setVariant(storedVariant);
      setThemeObj(catppuccin[storedVariant]);
    };
    loadTheme();
  }, []);

  const setThemeVariant = (newVariant: string) => {
    console.log("newVariant: ", newVariant)
    setVariant(newVariant);
    setThemeObj(catppuccin[newVariant]);
    setThemeToDB(newVariant); // save to Realm
  };

  return (
    <ThemeContext.Provider value={{ theme, variant, setThemeVariant }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
