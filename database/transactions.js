// database/transactions.js

import realm from './index';
import { v4 as uuidv4 } from 'uuid';

export const addTransaction = (tx) => {
  realm.write(() => {
    realm.create('Transaction', {
      id: uuidv4(),
      date: tx.date,
      description: tx.description,
      category: tx.category,
      amount: tx.amount,
      transactionType: tx.transactionType,
      isDuplicate: tx.isDuplicate || false,
      relatedIds: tx.relatedIds || [],
    });
  });
};

export const getTransactions = () => {
  return realm.objects('Transaction').sorted('date', true);
};

export const markDuplicate = (id, flag = true) => {
  realm.write(() => {
    const tx = realm.objectForPrimaryKey('Transaction', id);
    if (tx) tx.isDuplicate = flag;
  });
};

export const updateRelatedTransactions = (id, relatedIds) => {
  realm.write(() => {
    const tx = realm.objectForPrimaryKey('Transaction', id);
    if (tx) tx.relatedIds = relatedIds;
  });
};

export const deleteTransaction = (id) => {
  realm.write(() => {
    const tx = realm.objectForPrimaryKey('Transaction', id);
    if (tx) realm.delete(tx);
  });
};

export const clearAllTransactions = () => {
  realm.write(() => {
    const all = realm.objects('Transaction');
    realm.delete(all);
  });
};
