import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'expenses.db' });

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL,
        category TEXT,
        date TEXT,
        description TEXT,
        isDuplicate INTEGER,
        transactionType INTEGER
      );
    `);
  });
};

export const insertTransaction = (t) => {
  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO transactions (amount, category, date, description, isDuplicate, transactionType) VALUES (?, ?, ?, ?, ?, ?);`,
      [t.amount, t.category, t.date, t.description, t.isDuplicate ? 1 : 0, t.transactionType]
    );
  });
};

export const getTransactions = (callback) => {
  db.transaction(tx => {
    tx.executeSql(`SELECT * FROM transactions;`, [], (_, result) => {
      callback(result.rows._array);
    });
  });
};
