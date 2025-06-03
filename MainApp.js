// MainApp.js
import React from 'react';
import { View, Button } from 'react-native';
import { useTheme } from './ThemeContext';

const MainApp = () => {
  const { setThemeName } = useTheme();

  return (
    <View>
      <Button title="Latte" onPress={() => setThemeName('latte')} />
      <Button title="Frappé" onPress={() => setThemeName('frappe')} />
      <Button title="Macchiato" onPress={() => setThemeName('macchiato')} />
      <Button title="Mocha" onPress={() => setThemeName('mocha')} />
      {/* Rest of your app components */}
    </View>
  );
};

export default MainApp;
