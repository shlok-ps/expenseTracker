import axios from "axios";
import { consumeFromQueue } from "./queue";
import { config } from 'dotenv';
import { getWorkerToken } from "./utils/auth";
import { getTransactionFromMessage, IMessage, ITransaction } from "./utils/smsParser";
import { retry } from "./utils/retry";
config();

console.log("🔁 SMS Worker started...");

interface IQueueMessage {
  userId: string;
  message: IMessage;
}

const createTransactionMutationBody = {
  query: `mutation CreateTransaction($data: [AddTransactionItem!]!) {
      addTransaction(transactions: $data) {
          id
        }
      }`,
  operationName: "CreateTransaction",
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
      const transactionFromMessage = await retry<Promise<ITransaction>>(getTransactionFromMessage.bind(null, messageBody.message));
      if (transactionFromMessage.amount && transactionFromMessage.type) {
        console.log("Transaction extracted:", transactionFromMessage);
        const savedTran = await saveTransactionToServer(transactionFromMessage, messageBody.userId);
        if (savedTran.data.errors?.length > 0) {
          throw new Error("Error saving transaction: " + JSON.stringify(savedTran.data.errors));
        }
        console.log("Transaction saved to server:", transactionFromMessage.id);
      }
      else {
        throw new Error("Transaction not saved due to missing amount or type:" + transactionFromMessage);
      }
    }
    return true;
  } catch (e) {
    console.error("Error processing message:", e);
    return false;
  }
});

