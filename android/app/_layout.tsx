import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppProvider } from 'src/context/AppContext';
import { SyncProvider } from 'src/context/SyncContext';
import { ThemeProvider } from 'src/context/ThemeContext';
import { useAuth } from 'src/utils/auth';
import Toast from 'react-native-toast-message';

const queryClient = new QueryClient()

export default function RootLayout() {
  const { authChecked, authenticated } = useAuth();
  if (!authChecked) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <SyncProvider>
            <Stack initialRouteName={authenticated ? '(tabs)' : 'login'} screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ title: 'Home' }} />
              <Stack.Screen name="login" />
            </Stack>
          </SyncProvider>
        </AppProvider>
      </ThemeProvider>
      <Toast />
    </QueryClientProvider>
  );
}

