// database/index.js

import Realm from 'realm';
import { TransactionSchema, ThemeSchema } from 'src/database/schema';

const realm = new Realm({
  schema: [TransactionSchema, ThemeSchema],
  schemaVersion: 1,
});

export default realm;
