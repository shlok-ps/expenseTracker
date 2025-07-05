import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'src/context/ThemeContext';
import SmsSyncPanel from 'src/components/SyncPanel';
import { AIDetails, useAppContext } from 'src/context/AppContext';
import { AIOptions } from './constants';
import { MaterialIcons } from '@expo/vector-icons';
import { logout } from 'src/api/auth';

const SettingsScreen = () => {
  const { theme, variant, setThemeVariant } = useTheme();
  const { state: { setAIDetails, aiDetails } } = useAppContext()
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
        zIndex={themeOpen ? 99 : 0}
      />
      <DropDownPicker
        open={aiOpen}
        value={aiDetails.value}
        items={AIOptions.filter(o => !o.disabled)}
        setOpen={setAIOpen}
        setValue={(getValue) => {
          const value = getValue("");
          const option = AIOptions.find(ai => ai.value === value)
          setAIDetails(option as AIDetails);
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
        zIndex={aiOpen ? 99 : 0}
        textStyle={{ color: theme.text }}
      />
      <SmsSyncPanel />
      <TouchableOpacity onPress={logout} style={[styles.loginButton, { backgroundColor: theme.surface }]}>
        <MaterialIcons name="logout" size={24} color={theme.red} />
        <Text style={{ color: theme.text }}>Logout</Text>
      </TouchableOpacity>
    </View >
  );
};

const styles = StyleSheet.create({
  loginButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 50,
  },
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
