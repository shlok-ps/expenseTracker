import axios from "axios";
import { consumeFromQueue } from "./queue";
import { config } from 'dotenv';
import { getWorkerToken } from "./utils/auth";
config();

console.log("🔁 SMS Worker started...");

export interface IMessage {
  _id: string;
  body: string;
  date: number;
  address: string;
}

interface IQueueMessage {
  userId: string;
  message: IMessage;
}


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

const createTransactionMutationBody = {
  query: `mutation CreateTransaction($data: [AddTransactionItem!]!) {
      addTransaction(transactions: $data) {
          id
        }
      }`,
  operationName: "CreateTransaction",
}

const systemPrompt = `I received the following SMS. Analyze the SMS. Identify if it's a message for transaction. If yes, extract the transaction details. Return in the format {type: 'DEBIT'/'CREDIT'/'NONE', amount: number, currency: Code like 'INR'/'USD', date: string in YYYY-MM-dd format, fromAccount: string, toAccount: string, category: string}. Try to fetch all detals of from and to account and a category if possible. Avalable Debit categories: Travel, Food, Shopping, Investment, Transfer, Education, Entertainment, Utilities, Fuel, Others. Credit Categories: Transfer, Salary, Others. return only json No other text. If Not a transaction return empty json. For Example: ICICI Bank Acct XX527 debited for Rs 1370.00 on 02-Jun-25; MUKESH GARMENTS credited. UPI:876959075811. Call 18002662 for dispute. SMS BLOCK 527 to 9215676766. JSON: {\"type\": \"CREDIT\", \"amount\": 1370, \"currency\": \"INR\", \"date\": \"2025-06-02\", \"fromAccount\": \"ICICI Bank Acct XX527\", \"toAccount\": \"MUKESH GARMENTS UPI:876959075811\", \"category\": \"Shopping\"}. SMS:`

const getTransactionFromMessage = async (msg: IMessage): Promise<ITransaction> => {
  const res = await axios.post(process.env.LLM_BASE_URL || 'http://localhost:11434/api/generate', {
    model: 'llama3.2',
    "stream": false,
    "Prompt": systemPrompt + " SMS: " + msg.body,
    "format": "json"
  })
  const aiResponse = res.data.response;
  const data = JSON.parse(aiResponse);
  return {
    id: msg._id.toString(),
    description: "",
    amount: data.amount,
    type: data.type,
    date: (new Date(data.date)).getTime(),
    sourceDateTime: Number(msg.date),
    category: data.category,
    smsBody: msg.body,
    fromAccount: data.fromAccount || "",
    toAccount: data.toAccount || "",
    source: 'sms',
    sourceDescription: msg.address,
  }
}
const getIsMessageATransaction = async (sms: string) => {
  const { data } = await axios.post(
    (process.env.AI_BASE_URL || 'http://localhost:8000') + '/predict', {
    text: sms
  });
  return data.prediction === 'transaction';
}

const saveTransactionToServer = (transactionFromMessage: ITransaction, userId: string) => axios.post(process.env.SERVER_BASE_URL || 'http://localhost:4000/graphql',
  {
    ...createTransactionMutationBody,
    variables: { data: [transactionFromMessage] }
  },
  {
    headers: {
      Authorization: `Bearer ${getWorkerToken(userId)}`,
    },
  })

consumeFromQueue(async (messageBody: IQueueMessage) => {
  try {
    const isTransaction = await getIsMessageATransaction(messageBody.message.body);
    console.log("Processing message:", messageBody.message.body, "Is Transaction:", isTransaction);
    if (isTransaction) {
      const transactionFromMessage = await getTransactionFromMessage(messageBody.message);
      if (transactionFromMessage.amount && transactionFromMessage.type) {
        console.log("Transaction extracted:", transactionFromMessage);
        const savedTran = await saveTransactionToServer(transactionFromMessage, messageBody.userId);
        if (savedTran.data.errors?.length > 0) {
          throw new Error("Error saving transaction: " + JSON.stringify(savedTran.data.errors));
        }
        console.log("Transaction saved to server:", transactionFromMessage.id);
      }
      else {
        console.log("Transaction not saved due to missing amount or type:", transactionFromMessage);
      }
    }
    return true;
  } catch (e) {
    console.error("Error processing message:", e);
    return false;
  }
});

