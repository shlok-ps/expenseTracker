import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../ThemeContext';
import { initDB, insertTransaction, getTransactions } from '../database';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import uuid from 'react-native-uuid';

const HomeScreen = () => {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState('debit');
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState([
    { label: 'Food', value: 'Food' },
    { label: 'Transport', value: 'Transport' },
    { label: 'Bills', value: 'Bills' },
    { label: 'Salary', value: 'Salary' },
  ]);

  useEffect(() => {
    initDB();
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    getTransactions((txs) => {
      const marked = markDuplicates(txs);
      setTransactions(marked);
    });
  };

  const markDuplicates = (list) => {
    const seen = new Map();
    return list.map((tx) => {
      const key = `${tx.amount}-${tx.date}-${tx.category}`;
      if (seen.has(key)) {
        return { ...tx, isDuplicate: 1 };
      } else {
        seen.set(key, true);
        return { ...tx };
      }
    });
  };

  const addTransaction = () => {
    if (!amount || !category || !description) return;
    const newTx = {
      id: uuid.v4(),
      amount: parseFloat(amount),
      category,
      date: date.toISOString().split('T')[0],
      description,
      isDuplicate: 0,
      transactionType: type === 'credit' ? 1 : 0,
    };
    insertTransaction(newTx);
    setAmount('');
    setDescription('');
    setCategory(null);
    loadTransactions();
  };

  const toggleDuplicate = (id) => {
    const updated = transactions.map((tx) =>
      tx.id === id ? { ...tx, isDuplicate: tx.isDuplicate ? 0 : 1 } : tx
    );
    setTransactions(updated);
  };

  const TransactionItem = ({ tx }) => {
    const isCredit = tx.transactionType === 1;
    const bgColor = tx.isDuplicate ? theme.duplicate : theme.background;
    const borderColor = isCredit ? theme.credit : theme.debit;

    return (
      <View style={[styles.item, { backgroundColor: bgColor, borderColor }]}>
        <Text style={[styles.text, { color: theme.text }]}>
          {tx.description} - ₹{tx.amount}
        </Text>
        <Text style={[styles.text, { color: theme.text }]}>
          {tx.category} | {tx.date}
        </Text>
        {tx.isDuplicate && (
          <Text style={{ color: 'red', fontWeight: 'bold' }}>Duplicate</Text>
        )}
        <Button
          title={tx.isDuplicate ? 'Unflag' : 'Flag Duplicate'}
          onPress={() => toggleDuplicate(tx.id)}
          color={theme.primary}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>
        Add Transaction
      </Text>

      <TextInput
        style={[styles.input, { borderColor: theme.primary, color: theme.text }]}
        placeholder="Amount"
        placeholderTextColor={theme.text}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={[styles.input, { borderColor: theme.primary, color: theme.text }]}
        placeholder="Description"
        placeholderTextColor={theme.text}
        value={description}
        onChangeText={setDescription}
      />

      <DropDownPicker
        open={categoriesOpen}
        value={category}
        items={categoryItems}
        setOpen={setCategoriesOpen}
        setValue={setCategory}
        setItems={setCategoryItems}
        placeholder="Select Category"
        style={{ marginBottom: 10, borderColor: theme.primary }}
      />

      <View style={styles.row}>
        <Button title="Pick Date" onPress={() => setShowDatePicker(true)} />
        <Text style={[styles.text, { marginLeft: 10, color: theme.text }]}>
          {date.toDateString()}
        </Text>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="calendar"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || date;
            setShowDatePicker(false);
            setDate(currentDate);
          }}
        />
      )}

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => setType('debit')}
          style={[
            styles.typeButton,
            {
              borderColor: type === 'debit' ? theme.primary : theme.text,
            },
          ]}
        >
          <Text style={{ color: theme.text }}>Debit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setType('credit')}
          style={[
            styles.typeButton,
            {
              borderColor: type === 'credit' ? theme.primary : theme.text,
            },
          ]}
        >
          <Text style={{ color: theme.text }}>Credit</Text>
        </TouchableOpacity>
      </View>

      <Button title="Add" onPress={addTransaction} color={theme.primary} />

      <Text style={[styles.header, { color: theme.text }]}>
        Recent Transactions
      </Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => <TransactionItem tx={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 18,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    marginVertical: 6,
    padding: 10,
    borderRadius: 5,
  },
  item: {
    borderWidth: 2,
    padding: 10,
    marginVertical: 6,
    borderRadius: 5,
  },
  text: {
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  typeButton: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 6,
  },
});

export default HomeScreen;
