import axios from "axios"
import { IAppContext } from "src/AppContext"

const systemPrompt = "Analyze the following SMS and extract the transaction details. Return in the format {type: 'DEBIT'/'CREDIT'/'NONE', amount: number, currency: Code like 'INR'/'USD', date: epoch number}, return only json."
export const analyzeSMS = async (appContext: IAppContext, sms: string) => {
  try {
    const res = await axios.post(appContext.AI_BASE_URL + "/api/generate", {
      model: "llama3.2",
      options: {},
      "stream": false,
      "Prompt": systemPrompt + "SMS: " + sms
    })
    return res.data.response;
  } catch (e) {
    console.error('Error in analyzeSMS:', e);
  }
}
