import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from 'src/ThemeContext';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getTransactions } from 'src/database/transactions';
import { ITransaction } from 'src/types/transaction';

const ExportScreen = () => {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [filtered, setFiltered] = useState<ITransaction[]>([]);

  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryItems, setCategoryItems] = useState([
    { label: 'Food', value: 'Food' },
    { label: 'Transport', value: 'Transport' },
    { label: 'Bills', value: 'Bills' },
    { label: 'Salary', value: 'Salary' },
  ]);

  const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)));
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, selectedCategories, startDate, endDate]);

  const applyFilters = () => {
    const filteredTxs = transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      const inDateRange =
        txDate >= new Date(startDate.setHours(0, 0, 0, 0)) &&
        txDate <= new Date(endDate.setHours(23, 59, 59, 999));
      const inCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(tx.category);
      return inDateRange && inCategory && !tx.isDuplicate;
    });
    setFiltered(filteredTxs);
  };

  const exportToCSV = async () => {
    const header = 'Date,Description,Category,Amount,Type\n';
    const rows = filtered
      .map(
        (tx) =>
          `${tx.date},"${tx.description}",${tx.category},${tx.amount},${tx.type === 1 ? 'Credit' : 'Debit'
          }`
      )
      .join('\n');
    const csv = header + rows;

    const path = `${RNFS.DocumentDirectoryPath}/transactions_${Date.now()}.csv`;
    await RNFS.writeFile(path, csv, 'utf8');
    Share.open({ url: 'file://' + path, type: 'text/csv' }).catch(console.error);
  };

  const exportToPDF = async () => {
    const htmlContent = `
      <h2>Expense Report</h2>
      <table border="1" style="width:100%; border-collapse:collapse;">
        <tr>
          <th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Type</th>
        </tr>
        ${filtered
        .map(
          (tx) => `
          <tr>
            <td>${tx.date}</td>
            <td>${tx.description}</td>
            <td>${tx.category}</td>
            <td>₹${tx.amount}</td>
            <td>${tx.type === 1 ? 'Credit' : 'Debit'}</td>
          </tr>
        `
        )
        .join('')}
      </table>
    `;
    const file = await RNHTMLtoPDF.convert({
      html: htmlContent,
      fileName: `transactions_${Date.now()}`,
      base64: false,
    });
    Share.open({ url: Platform.OS === 'android' ? 'file://' + file.filePath : file.filePath });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Export Transactions</Text>

      <Text style={[styles.label, { color: theme.text }]}>Filter by Category:</Text>
      <DropDownPicker
        open={categoriesOpen}
        value={selectedCategories}
        items={categoryItems}
        setOpen={setCategoriesOpen}
        setValue={setSelectedCategories}
        setItems={setCategoryItems}
        multiple={true}
        placeholder="Select Categories"
        style={{ marginBottom: 10, borderColor: theme.primary }}
      />

      <View style={styles.row}>
        <Button title="Start Date" onPress={() => setShowStart(true)} />
        <Text style={[styles.label, { color: theme.text }]}>
          {startDate.toDateString()}
        </Text>
        {showStart && (
          <DateTimePicker
            value={startDate}
            mode="date"
            onChange={(e, selectedDate) => {
              setShowStart(false);
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )}
      </View>

      <View style={styles.row}>
        <Button title="End Date" onPress={() => setShowEnd(true)} />
        <Text style={[styles.label, { color: theme.text }]}>
          {endDate.toDateString()}
        </Text>
        {showEnd && (
          <DateTimePicker
            value={endDate}
            mode="date"
            onChange={(e, selectedDate) => {
              setShowEnd(false);
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )}
      </View>

      <View style={styles.exportButtons}>
        <Button title="Export to CSV" onPress={exportToCSV} color={theme.primary} />
        <View style={{ height: 12 }} />
        <Button title="Export to PDF" onPress={exportToPDF} color={theme.primary} />
      </View>

      <Text style={[styles.label, { color: theme.text, marginTop: 12 }]}>
        {filtered.length} transactions selected (excluding duplicates)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    justifyContent: 'space-between',
  },
  exportButtons: {
    marginTop: 12,
  },
});

export default ExportScreen;
