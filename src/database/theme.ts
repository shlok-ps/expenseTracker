// database/theme.js

import realm from './index';

export const setThemeToDB = (variant: string) => {
  realm.write(() => {
    const theme = realm.objects('Theme')[0];
    if (theme) {
      theme.variant = variant;
    } else {
      realm.create('Theme', {
        id: 'theme',
        variant,
      });
    }
  });
};

export const getThemeFromDB = (): string => {
  const theme = realm.objects('Theme')[0];
  return theme ? theme.variant as string : 'mocha';
};
