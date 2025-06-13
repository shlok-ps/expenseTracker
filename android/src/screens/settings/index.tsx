import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'src/context/ThemeContext';
import SmsSyncPanel from 'src/components/SyncPanel';
import { useAppContext } from 'src/context/AppContext';
import { AIOptions } from './constants';

const SettingsScreen = () => {
  const { theme, variant, setThemeVariant } = useTheme();
  const [selectedAIBaseURL, setSelectedAIBaseURL] = useState<string>('https://api.example.com/ai');
  const { setState: setAppState } = useAppContext()

  const [themeOpen, setThemeOpen] = useState(false);
  const [aiOpen, setAIOpen] = useState(false);
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

  const updateTheme = async (getValue: () => string) => {
    const value = getValue();
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

      <DropDownPicker
        open={aiOpen}
        value={selectedAIBaseURL}
        items={AIOptions}
        setOpen={setAIOpen}
        setValue={(getValue) => {
          const value = getValue();
          setSelectedAIBaseURL(value);
          const option = AIOptions.find(ai => ai.value === value)
          const newAppState = { AI_BASE_URL: option?.baseURL || '', model: option?.model || '', value: option?.value || '' }
          console.log('newAppState: ', newAppState);
          setAppState(newAppState);
        }}
        placeholder="Select AI"
        style={{
          borderColor: theme.primary,
          backgroundColor: theme.surface,
        }}
        dropDownContainerStyle={{
          backgroundColor: theme.surface,
          borderColor: theme.primary,
        }}
        zIndex={themeOpen ? -1 : undefined}
        textStyle={{ color: theme.text }}
      />
      <SmsSyncPanel />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    gap: 10,
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
