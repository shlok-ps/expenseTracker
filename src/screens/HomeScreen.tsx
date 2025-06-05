// screens/HomeScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTheme } from 'src/ThemeContext';
import { getTransactions, ITransaction } from 'src/database/transactions';

const HomeScreen = () => {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const data = getTransactions();
    console.log('data: ', data)
    //    setTransactions([...data]); // Realm collections need to be spread into array
  }, []);

  const renderItem = ({ item }: { item: ITransaction }) => (
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
          color: item.transactionType === 0 ? theme.red : theme.green,
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
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Transactions</Text>
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
