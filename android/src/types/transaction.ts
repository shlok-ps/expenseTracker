export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
};

export interface ITransaction {
  id: string;
  date?: number;
  sourceDateTime: number;
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
  isDuplicate?: boolean;
  relatedIds?: string[];
  smsBody: string;
  fromAccount?: string;
  toAccount?: string;
  source?: string;
  sourceDescription?: string;
}
