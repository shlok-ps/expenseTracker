import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useTheme } from 'src/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme()
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: theme.mantle } }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: () => <MaterialIcons name="home" color={theme.text} size={32} /> }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics', tabBarIcon: () => <MaterialIcons name="analytics" color={theme.text} size={32} /> }} />
      <Tabs.Screen name="export" options={{ title: 'Export', tabBarIcon: () => <MaterialIcons name="share" color={theme.text} size={32} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: () => <MaterialIcons name="settings" color={theme.text} size={32} /> }} />
    </Tabs >
  );
}

