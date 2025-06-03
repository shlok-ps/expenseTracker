// database/theme.js

import realm from './index';

export const setTheme = (variant) => {
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

export const getTheme = () => {
  const theme = realm.objects('Theme')[0];
  return theme ? theme.variant : 'mocha';
};
