// database/schema.js

export const TransactionSchema = {
  name: 'Transaction',
  primaryKey: 'id',
  properties: {
    id: 'string',
    date: 'date',
    description: 'string',
    category: 'string',
    amount: 'double',
    transactionType: 'int', // 0 = debit, 1 = credit
    isDuplicate: { type: 'bool', default: false },
    relatedIds: 'string[]',
  },
};

export const ThemeSchema = {
  name: 'Theme',
  primaryKey: 'id',
  properties: {
    id: 'string',
    variant: 'string',
  },
};
