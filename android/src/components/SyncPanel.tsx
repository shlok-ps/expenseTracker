import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useSync } from 'src/context/SyncContext';
import { Bar } from 'react-native-progress'
import { useTheme } from 'src/context/ThemeContext';
import { getLastSyncedDateTime, saveLastSyncedDateTime } from 'src/services/sms/helper';
import commonStyles from 'common/commonStyles';
import { useEffect, useMemo, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SmsSyncPanel() {
  const { isSyncing, progress, startSync, stopSync: _stopSync } = useSync();
  const { theme } = useTheme();
  const [syncedTill, setSyncedTill] = useState<Date | null>(null);
  const [enableStopping, setEnableStopping] = useState(true);

  const getAndPopulateSyncedDate = async () => {
    setSyncedTill(new Date(await getLastSyncedDateTime()));
  }
  useEffect(() => {
    if (!isSyncing) {
      getAndPopulateSyncedDate()
      setEnableStopping(true)
    }
  }, [isSyncing])

  const resetSyncedTill = async () => {
    await saveLastSyncedDateTime(0);
    getAndPopulateSyncedDate()
  }
  const stopSync = () => {
    setEnableStopping(false)
    _stopSync()
  }
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', color: theme.text }}>SMS Sync</Text>

      {isSyncing ? (
        <>
          <Text style={{ color: theme.text }}>Progress: {progress}%</Text>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <Bar progress={progress / 100}
              color={theme.primary}
              indeterminate={!enableStopping}
            />
            {
              enableStopping ? (
                <TouchableOpacity onPress={stopSync} style={{ padding: 10, borderRadius: 5 }}>
                  <MaterialIcons name='stop' style={{ color: theme.red, fontSize: 25 }} />
                </TouchableOpacity>
              ) : null
            }
          </View>
        </>
      ) : (
        <View style={styles.preSyncContainer}>
          <View>
            <Text style={[commonStyles.settingsLabel, { color: theme.text }]}>
              Synced Till:
            </Text>
            <Text style={{ color: theme.text }}>
              {syncedTill?.toLocaleString() || 'Never Synced'}
            </Text>
          </View>
          <TouchableOpacity onPress={resetSyncedTill} style={{ padding: 10, borderRadius: 5 }}>
            <MaterialIcons name='refresh' style={{ color: theme.primary, fontSize: 25 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={startSync} style={{ padding: 10, borderRadius: 5 }}>
            <MaterialIcons name='play-arrow' style={{ color: theme.primary, fontSize: 25 }} />
          </TouchableOpacity>
        </View>
      )}
    </View >
  );
}

const styles = StyleSheet.create({
  preSyncContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  }
})
