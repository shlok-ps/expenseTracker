import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTheme } from '../ThemeContext';

const ExpenseItem = ({ transaction, toggleDuplicateFlag }) => {
  const { theme } = useTheme();
  const { id, amount, category, description, isDuplicate, transactionType } = transaction;

  const itemStyle = {
    backgroundColor: isDuplicate ? theme.duplicate : theme.background,
    padding: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: transactionType === 1 ? theme.credit : theme.debit,
  };

  const amountStyle = {
    color: transactionType === 1 ? theme.credit : theme.debit,
    fontWeight: 'bold',
  };

  return (
    <View style={itemStyle}>
      <Text style={{ fontWeight: 'bold', color: theme.text }}>{description}</Text>
      <Text style={amountStyle}>{`Amount: ${amount}`}</Text>
      <Text style={{ color: theme.text }}>{`Category: ${category}`}</Text>
      <Text style={{ color: theme.text }}>{`Duplicate: ${isDuplicate ? 'Yes' : 'No'}`}</Text>

      <Button
        title={isDuplicate ? 'Unflag Duplicate' : 'Flag as Duplicate'}
        onPress={() => toggleDuplicateFlag(id, isDuplicate)}
        color={theme.primary}
      />

      {isDuplicate && (
        <Text style={{ color: 'red', fontWeight: 'bold', marginTop: 5 }}>
          Duplicate Transaction
        </Text>
      )}
    </View>
  );
};

export default ExpenseItem;
