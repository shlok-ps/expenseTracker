import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import commonStyles from 'common/commonStyles';
import { useEffect, useState } from 'react';
import { Button, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Bar } from 'react-native-progress';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import { useSync } from 'src/context/SyncContext';
import { useTheme } from 'src/context/ThemeContext';
import { getLastSyncedDateTime, saveLastSyncedDateTime } from 'src/services/sms/helper';

export default function SmsSyncPanel() {
  const { isSyncing, progress, startSync, stopSync: _stopSync } = useSync();
  const defaultStyles = useDefaultStyles();
  const { theme } = useTheme();
  const [syncedTill, setSyncedTill] = useState<Date>(new Date());
  const [enableStopping, setEnableStopping] = useState(true);
  const [showDatePickerSingle, setShowDatePickerSingle] = useState(false);

  const getAndPopulateSyncedDate = async () => {
    setSyncedTill(new Date(await getLastSyncedDateTime()));
  }
  useEffect(() => {
    if (!isSyncing) {
      getAndPopulateSyncedDate()
      setEnableStopping(true)
    }
  }, [isSyncing])

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
          <TouchableOpacity onPress={() => setShowDatePickerSingle(true)} style={{ padding: 10, borderRadius: 5 }}>
            <MaterialIcons name='cached' style={{ color: theme.primary, fontSize: 25 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={startSync} style={{ padding: 10, borderRadius: 5 }}>
            <MaterialIcons name='play-arrow' style={{ color: theme.primary, fontSize: 25 }} />
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showDatePickerSingle} animationType="slide" transparent
        onRequestClose={() => setShowDatePickerSingle((false))}
      >
        <View style={[styles.modalView, { backgroundColor: theme.surface }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDatePickerSingle(false)} >
              <MaterialIcons name='close' style={{ color: theme.red, fontSize: 25 }} />
            </TouchableOpacity>
          </View>
          <DateTimePicker
            mode="single"
            date={syncedTill}
            onChange={({ date }) => {
              setSyncedTill(date as Date)
              setShowDatePickerSingle(false);
            }}
            styles={{
              ...defaultStyles,
              selected: { color: theme.primary, backgroundColor: theme.primary + '20' },
              day_label: { color: theme.text },
              year_label: { color: theme.text },
              active_year: { color: theme.primary, backgroundColor: theme.primary + '20' },
              active_year_label: { color: theme.text },
              selected_year: { color: theme.primary, backgroundColor: theme.primary + '100' },
              outside_label: { color: theme.subtle },
              month_label: { color: theme.text },
              selected_label: { color: theme.text },
              button_next_image: { tintColor: theme.text },
              selected_month_label: { color: theme.text },
              selected_year_label: { color: theme.text },
              selected_month: { color: theme.primary, backgroundColor: theme.primary + '20' },
              today_label: { color: theme.text },
              month_selector_label: { color: theme.text },
              year_selector_label: { color: theme.text },
              button_prev_image: { tintColor: theme.text },
              header: { color: theme.text, backgroundColor: theme.surface },
              day: { color: theme.text },
              day_cell: { color: theme.text, backgroundColor: theme.surface },
            }}
          />
        </View>
      </Modal>
    </View >
  );
}

const styles = StyleSheet.create({
  preSyncContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    marginTop: '50%',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    padding: 2
  }
})
