// database/index.js

import Realm from 'realm';
import { TransactionSchema, ThemeSchema } from './schema';

const realm = new Realm({
  schema: [TransactionSchema, ThemeSchema],
  schemaVersion: 1,
});

export default realm;
