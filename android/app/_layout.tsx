import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppProvider } from 'src/AppContext';
import { ThemeProvider } from 'src/ThemeContext';
import { useAuth } from 'src/utils/auth';

const queryClient = new QueryClient()

export default function RootLayout() {
  const { authChecked, authenticated } = useAuth();
  if (!authChecked) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <Stack initialRouteName={authenticated ? '(tabs)' : 'login'} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ title: 'Home' }} />
            <Stack.Screen name="login" />
          </Stack>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

