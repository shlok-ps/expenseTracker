import { Stack } from 'expo-router';
import { AppProvider } from 'src/AppContext';
import { ThemeProvider } from 'src/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </AppProvider>
    </ThemeProvider>
  );
}

