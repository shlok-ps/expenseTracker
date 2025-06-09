import axios from "axios"
import { IAppContext } from "src/context/AppContext"

const systemPrompt = `I received the following SMS. Analyze the SMS. Identify if it's a message for transaction. 
If yes, extract the transaction details. Return in the format 
{type: 'DEBIT'/'CREDIT'/'NONE', amount: number, currency: Code like 'INR'/'USD', date: epoch number in milliseconds, fromAccount: string, toAccount: string, category: string}. 
Try to fetch all detals of from and to account and a category if possible. Give date as epoch in milliseconds.
Avalable Debit categories: Travel, Food, Shopping, Investment, Transfer, Education, Entertainment, Utilities, Fuel, Others. 
Credit Categories: Transfer, Salary, Others. return only json No other text. If Not a transaction return empty json.`

export const analyzeSMS = async (appContext: IAppContext, sms: string) => {
  try {
    const res = await axios.post(appContext.AI_BASE_URL + "/api/generate", {
      model: "qwen2.5",
      options: {},
      "stream": false,
      "Prompt": systemPrompt + " SMS: " + sms,
      "format": "json"
    })
    return res.data.response;
  } catch (e) {
    console.error('Error in analyzeSMS:', e);
  }
}
