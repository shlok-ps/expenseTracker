import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppProvider } from 'src/AppContext';
import { ThemeProvider } from 'src/ThemeContext';
import { getAccessToken, useAuth } from 'src/utils/auth';
import LoginScreen from './login';

export default function RootLayout() {
  const { authChecked, authenticated } = useAuth();
  if (!authChecked) return null;

  return (
    <ThemeProvider>
      <AppProvider>
        <Stack initialRouteName={authenticated ? '(tabs)' : 'login'} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ title: 'Home' }} />
          <Stack.Screen name="login" />
        </Stack>
      </AppProvider>
    </ThemeProvider>
  );
}

