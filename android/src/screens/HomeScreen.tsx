import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Button, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RealmPlugin from 'realm-flipper-plugin-device';
import { useGetTransactions } from 'src/api/transactions';
import { useAppInit } from 'src/App';
import { useSync } from 'src/context/SyncContext';
import { useTheme } from 'src/context/ThemeContext';
import realm from 'src/database';
import { getLastSyncedDateTime } from 'src/services/sms/helper';
import { ITheme } from 'src/theme/catppuccin';
import { ITransaction, TransactionType } from 'src/types/transaction';
import { useAuth } from 'src/utils/auth';

const RenderItem = ({ item, theme }: { item: ITransaction, theme: ITheme }) => (
  <TouchableOpacity onPress={() => { router.push("/transactions/" + item.id) }}>
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: item.isDuplicate ? theme.red : theme.primary,
        },
      ]}
    >
      <Text style={[styles.description, { color: theme.text }]}>
        {item.toAccount || item.fromAccount || item.description}
      </Text>
      <Text
        style={{
          color: item.type === TransactionType.CREDIT ? theme.green : theme.red,
          fontWeight: 'bold',
        }}
      >
        ₹ {item.amount.toFixed(2)}
      </Text>
      <Text style={{ color: theme.subtle }}>
        {new Date(item.sourceDateTime).toDateString()} • {item.category}
      </Text>
      {item.isDuplicate && (
        <Text style={{ color: theme.red, fontSize: 12 }}>⚠ Duplicate</Text>
      )}
    </View>
  </TouchableOpacity>
);

const HomeScreen = () => {
  useAppInit()
  const { theme } = useTheme();
  const { data: transactions, refetch, isFetching, isLoading } = useGetTransactions()

  const onRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  const { authenticated } = useAuth();
  const { startSync } = useSync();
  useEffect(() => {
    if (authenticated && !!getLastSyncedDateTime()) {
      startSync()
    }
  }, [authenticated])

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <RealmPlugin realms={[realm]} />
      <Text style={[styles.header, { color: theme.text }]}>Home
      </Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RenderItem theme={theme} item={item} />}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          <Text style={{ color: theme.text, textAlign: 'center', marginTop: 30 }}>
            No transactions yet.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeScreen;
