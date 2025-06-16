import axios from "axios";
import { AIDetails, AIType, IAppContext } from "src/context/AppContext";

const systemPrompt = `I received the following SMS. Analyze the SMS. Identify if it's a message for transaction. If yes, extract the transaction details. Return in the format {type: 'DEBIT'/'CREDIT'/'NONE', amount: number, currency: Code like 'INR'/'USD', date: string in YYYY-MM-dd format, fromAccount: string, toAccount: string, category: string}. Try to fetch all detals of from and to account and a category if possible. Avalable Debit categories: Travel, Food, Shopping, Investment, Transfer, Education, Entertainment, Utilities, Fuel, Others. Credit Categories: Transfer, Salary, Others. return only json No other text. If Not a transaction return empty json. For Example: ICICI Bank Acct XX527 debited for Rs 1370.00 on 02-Jun-25; MUKESH GARMENTS credited. UPI:876959075811. Call 18002662 for dispute. SMS BLOCK 527 to 9215676766. JSON: {\"type\": \"CREDIT\", \"amount\": 1370, \"currency\": \"INR\", \"date\": \"2025-06-02\", \"fromAccount\": \"ICICI Bank Acct XX527\", \"toAccount\": \"MUKESH GARMENTS UPI:876959075811\", \"category\": \"Shopping\"}. SMS:`

export const analyzeSMS = async (appContext: AIDetails, sms: string) => {
  if (appContext.type === AIType.OLLAMA) {
    const res = await axios.post(appContext.baseURL, {
      model: appContext.model,
      options: {},
      "stream": false,
      "Prompt": systemPrompt + " SMS: " + sms,
      "format": "json"
    })
    return res.data.response;
  } else if (appContext.type === AIType.OpenAI) {
    const res = await axios.post(appContext.baseURL, {
      model: appContext.model,
      messages: [
        {
          "role": "system",
          "content": systemPrompt
        },
        {
          "role": "user",
          content: sms
        }
      ],
      response_format: {
        type: "json",
        json_schema: {
          "name": "transaction",
          "schema": {
            "type": "object",
            "properties": {
              "type": {
                "type": "string",
                "enum": [
                  "DEBIT",
                  "CREDIT",
                  "NONE"
                ],
                "description": "The type of the transaction."
              },
              "amount": {
                "type": "number",
                "description": "The amount of money involved in the transaction."
              },
              "currency": {
                "type": "string",
                "description": "The currency code, such as 'INR' or 'USD'."
              },
              "date": {
                "type": "number",
                "description": "The date of the transaction, YYYY-MM-dd format. like 2025-12-02"
              },
              "fromAccount": {
                "type": "string",
                "description": "The account from which the amount is debited."
              },
              "toAccount": {
                "type": "string",
                "description": "The account to which the amount is credited."
              },
              "category": {
                "type": "string",
                "description": "The category of the transaction."
              }
            },
            "required": [
              "type",
              "amount",
              "currency",
              "date",
              "fromAccount",
              "toAccount",
              "category"
            ],
            "additionalProperties": false
          },
          strict: true
        },
        strict: true
      },
    }, {
      headers: {
        Authorization: `Bearer ${""}`,
      }
    })
    console.log("Response from AI:", res.data);
    return res.data.choices[0].message.content;
  }
}
