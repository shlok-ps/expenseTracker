import axios from "axios";

export interface IMessage {
  _id: string;
  body: string;
  date: number;
  address: string;
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

const systemPrompt = `I received the following SMS. Analyze the SMS. Identify if it's a message for transaction. If yes, extract the transaction details. Return in the format {type: 'DEBIT'/'CREDIT'/'NONE', amount: number, currency: Code like 'INR'/'USD', date: string in YYYY-MM-dd format, fromAccount: string, toAccount: string, category: string}. Try to fetch all detals of from and to account and a category if possible. Avalable Debit categories: Travel, Food, Shopping, Investment, Transfer, Education, Entertainment, Utilities, Fuel, Others. Credit Categories: Transfer, Salary, Others. return only json No other text. If Not a transaction return empty json. For Example: ICICI Bank Acct XX527 debited for Rs 1370.00 on 02-Jun-25; MUKESH GARMENTS credited. UPI:876959075811. Call 18002662 for dispute. SMS BLOCK 527 to 9215676766. JSON: {\"type\": \"CREDIT\", \"amount\": 1370, \"currency\": \"INR\", \"date\": \"2025-06-02\", \"fromAccount\": \"ICICI Bank Acct XX527\", \"toAccount\": \"MUKESH GARMENTS UPI:876959075811\", \"category\": \"Shopping\"}.`

const parseWithOLLAMA = async (messageText: string) => {
  const res = await axios.post(process.env.LLM_BASE_URL || 'http://localhost:11434/api/generate', {
    model: 'llama3.2',
    "stream": false,
    "Prompt": systemPrompt + " SMS: " + messageText,
    "format": "json"
  })
  const aiResponse = res.data.response;
  const data = JSON.parse(aiResponse);
  return data;
}

const parseWithopenRouter = async (messageText: string) => {
  var options = {
    method: 'POST',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    data: {
      model: 'meta-llama/llama-3.3-70b-instruct',
      response_format: {
        name: 'transaction',
        schema: {
          type: 'object',
          properties: {
            type: { type: 'string', description: 'The type of the transaction.', enum: ['CREDIT', 'DEBIT'] },
            amount: {
              type: 'number',
              description: 'The amount of money involved in the transaction.'
            },
            currency: {
              type: 'string',
              description: 'The currency in which the transaction is made.',
              enum: ['INR']
            },
            date: {
              type: 'string',
              description: 'The date of the transaction in YYYY-MM-DD format.',
              format: 'date'
            },
            fromAccount: {
              type: 'string',
              description: 'The account from which the money is transferred.'
            },
            toAccount: { type: 'string', description: 'The account to which the money is transferred.' },
            category: { type: 'string', description: 'The category of the transaction.' }
          },
          required: ['type', 'amount', 'currency', 'date', 'fromAccount', 'toAccount', 'category'],
          additionalProperties: false
        },
        strict: true
      },
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: messageText
        }
      ],
      provider: { data_collection: 'deny' }
    }
  };

  const axiosRes = await axios.request(options)
  return JSON.parse(axiosRes.data.choices[0].message.content);
}

export const getTransactionFromMessage = async (msg: IMessage): Promise<ITransaction> => {
  const data = await parseWithopenRouter(msg.body);
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
