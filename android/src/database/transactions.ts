// database/transactions.js

import { ITransaction } from 'src/types/transaction';
import realm from './index';
import { v4 as uuidv4 } from 'uuid';

export const addTransaction = (txs: ITransaction[]) => {
  realm.write(() => {
    for (let tx of txs) {
      realm.create('Transaction', {
        id: tx.id,
        date: tx.date,
        description: tx.description,
        category: tx.category,
        amount: tx.amount,
        transactionType: tx.type,
        isDuplicate: tx.isDuplicate || false,
        relatedIds: tx.relatedIds || [],
      });
    }
  });
};

export const getTransactions = () => {
  return realm.objects('Transaction').sorted('date', true);
};

export const markDuplicate = (id: string, flag = true) => {
  realm.write(() => {
    const tx = realm.objectForPrimaryKey('Transaction', id);
    if (tx) tx.isDuplicate = flag;
  });
};

export const updateRelatedTransactions = (id: string, relatedIds: string[]) => {
  realm.write(() => {
    const tx = realm.objectForPrimaryKey('Transaction', id);
    if (tx) tx.relatedIds = relatedIds;
  });
};

export const deleteTransaction = (id: string) => {
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
