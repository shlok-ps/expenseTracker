import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ScrollView,
  Button,
} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from 'src/context/ThemeContext';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getTransactions } from 'src/database/transactions';
import { ITransaction } from 'src/types/transaction';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen = () => {
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
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, selectedCategories, startDate, endDate]);

  const loadTransactions = () => {
    setTransactions(getTransactions());
  };

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

  const groupByCategory = () => {
    const map: { [key: string]: number } = {};
    filtered.forEach((tx) => {
      if (!map[tx.category]) map[tx.category] = 0;
      map[tx.category] += tx.amount;
    });
    return Object.keys(map).map((key, index) => ({
      name: key,
      amount: map[key],
      color: generateColor(index),
      legendFontColor: theme.text,
      legendFontSize: 12,
    }));
  };

  const groupByDate = () => {
    const map: { [key: string]: number } = {};
    filtered.forEach((tx) => {
      const d = tx.date;
      if (!map[d]) map[d] = 0;
      map[d] += tx.amount;
    });
    return {
      labels: Object.keys(map),
      datasets: [{ data: Object.values(map) }],
    };
  };

  const generateColor = (i: number) => {
    const colors = [
      '#f38ba8',
      '#a6e3a1',
      '#f9e2af',
      '#cba6f7',
      '#94e2d5',
      '#fab387',
    ];
    return colors[i % colors.length];
  };

  return (
    <ScrollView style={{ backgroundColor: theme.background }}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>
          Analytics Dashboard
        </Text>

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

        <View style={styles.datePickerRow}>
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

        <View style={styles.datePickerRow}>
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

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Pie Chart by Category
        </Text>
        {filtered.length > 0 ? (
          <PieChart
            data={groupByCategory()}
            width={screenWidth - 16}
            height={220}
            chartConfig={{
              backgroundColor: theme.background,
              backgroundGradientFrom: theme.background,
              backgroundGradientTo: theme.background,
              color: () => theme.primary,
              labelColor: () => theme.text,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <Text style={[styles.text, { color: theme.text }]}>No data</Text>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Bar Chart by Date
        </Text>
        {filtered.length > 0 ? (
          <BarChart
            data={groupByDate()}
            width={screenWidth - 16}
            height={250}
            yAxisLabel="₹"
            yAxisSuffix=''
            chartConfig={{
              backgroundColor: theme.background,
              backgroundGradientFrom: theme.background,
              backgroundGradientTo: theme.background,
              color: () => theme.primary,
              labelColor: () => theme.text,
            }}
            verticalLabelRotation={30}
          />
        ) : (
          <Text style={[styles.text, { color: theme.text }]}>No data</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    marginVertical: 10,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
});

export default AnalyticsScreen;
