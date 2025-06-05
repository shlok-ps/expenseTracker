import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useTheme } from 'src/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme()
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: () => <MaterialIcons name="home" color={theme.accent} siuze={32} /> }} />
    </Tabs >
  );
}

