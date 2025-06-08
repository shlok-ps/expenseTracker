// screens/HomeScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { useAppInit } from 'src/App';
import { useTheme } from 'src/ThemeContext';
import realm from 'src/database'
import RealmPlugin from 'realm-flipper-plugin-device'
import { useCreateTransactionMutation, useGetTransactions } from 'src/api/transactions';
import { ITransaction } from 'src/types/transaction';
import { syncMessages } from 'src/services/sms/helper';
import { useAppContext } from 'src/AppContext';
import axios from 'axios';

const HomeScreen = () => {
  useAppInit()
  const { theme } = useTheme();
  const { data: transactions } = useGetTransactions()
  console.log("TXNs: ", transactions);

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
          color: item.type === 0 ? theme.red : theme.green,
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

  const appContext = useAppContext();
  const { mutate: addTransactionsToServer } = useCreateTransactionMutation();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <RealmPlugin realms={[realm]} />
      <Text style={[styles.header, { color: theme.text }]}>Home
        <Button title={'S'} onPress={() => { syncMessages(appContext, addTransactionsToServer) }}></Button>
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
