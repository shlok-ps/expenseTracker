import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, setThemeVariant } from '../ThemeContext';

const SettingsScreen = () => {
  const { theme, variant } = useTheme();

  const [themeOpen, setThemeOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(variant);
  const [themeOptions, setThemeOptions] = useState([
    { label: 'Latte ☕️', value: 'latte' },
    { label: 'Frappe 🧋', value: 'frappe' },
    { label: 'Macchiato ☁️', value: 'macchiato' },
    { label: 'Mocha 🍫', value: 'mocha' },
  ]);

  useEffect(() => {
    setSelectedTheme(variant);
  }, [variant]);

  const updateTheme = async (value) => {
    setSelectedTheme(value);
    await AsyncStorage.setItem('theme-variant', value);
    setThemeVariant(value);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>App Settings</Text>

      <Text style={[styles.label, { color: theme.text }]}>Choose Theme:</Text>

      <DropDownPicker
        open={themeOpen}
        value={selectedTheme}
        items={themeOptions}
        setOpen={setThemeOpen}
        setValue={updateTheme}
        setItems={setThemeOptions}
        placeholder="Select Theme"
        style={{
          borderColor: theme.primary,
          backgroundColor: theme.surface,
        }}
        dropDownContainerStyle={{
          backgroundColor: theme.surface,
          borderColor: theme.primary,
        }}
        textStyle={{ color: theme.text }}
      />

      <Text
        style={[
          styles.previewText,
          { color: theme.text, backgroundColor: theme.surface },
        ]}
      >
        Live Preview using {selectedTheme} theme 🌈
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  previewText: {
    marginTop: 20,
    fontSize: 16,
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
  },
});

export default SettingsScreen;
