import React from 'react';
import { FlatList } from 'react-native';
import ExpenseItem from './ExpenseItem';

const ExpenseList = ({ transactions, toggleDuplicateFlag }) => {
  return (
    <ScrollView style={{ padding: 10 }}>
      {transactions.map((transaction) => (
        <ExpenseItem key={transaction.id} transaction={transaction} toggleDuplicateFlag={toggleDuplicateFlag}/>
      ))}
    </ScrollView>
  );
};

export default ExpenseList
 
