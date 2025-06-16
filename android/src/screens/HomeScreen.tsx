import { router } from 'expo-router';
import React from 'react';
import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RealmPlugin from 'realm-flipper-plugin-device';
import { useGetTransactions } from 'src/api/transactions';
import { useAppInit } from 'src/App';
import { useSync } from 'src/context/SyncContext';
import { useTheme } from 'src/context/ThemeContext';
import realm from 'src/database';
import { ITransaction, TransactionType } from 'src/types/transaction';

const HomeScreen = () => {
  useAppInit()
  const { theme } = useTheme();
  const { data: transactions } = useGetTransactions()
  const { startSync } = useSync();

  const renderItem = ({ item }: { item: ITransaction }) => (
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
          {item.description}
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
          {new Date(item.date).toDateString()} • {item.category}
        </Text>
        {item.isDuplicate && (
          <Text style={{ color: theme.red, fontSize: 12 }}>⚠ Duplicate</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <RealmPlugin realms={[realm]} />
      <Text style={[styles.header, { color: theme.text }]}>Home
      </Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
