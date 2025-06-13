import { View, Text, Button } from 'react-native';
import { useSync } from 'src/context/SyncContext';
import { Bar } from 'react-native-progress'
import { useTheme } from 'src/context/ThemeContext';

export default function SmsSyncPanel() {
  const { isSyncing, progress, startSync, stopSync } = useSync();
  const { theme } = useTheme();

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', color: theme.text }}>SMS Sync</Text>

      {isSyncing ? (
        <>
          <Text style={{ color: theme.text }}>Progress: {progress}%</Text>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 10 }}>
            <Bar progress={progress} width={0.3} color={theme.primary} />
            <Button title="Stop Sync" color={theme.red} onPress={stopSync} />
          </View>
        </>
      ) : (
        <Button title="Start Sync" onPress={startSync} />
      )}
    </View>
  );
}

