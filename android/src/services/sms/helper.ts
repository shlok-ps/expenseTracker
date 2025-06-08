import { Platform, PermissionsAndroid } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import { analyzeSMS } from '../ai';
import { IAppContext } from 'src/AppContext';
import { addTransaction } from '../transactions';


export const requestSMSPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Permission',
        message: 'This app needs access to your SMS to detect transactions',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return false;
};

export const parseSMS = (msg: any) => {
  const match = msg.body.match(/(?:INR|Rs\.?)\s?([\d,]+\.?\d{0,2})/i);
  if (!match) return null;
  const amount = parseFloat(match[1].replace(/,/g, ''));
  const type = /debited|spent|purchase/i.test(msg.body) ? 'debit' : 'credit';
  return {
    id: msg._id,
    body: msg.body,
    amount,
    type,
    date: new Date(Number(msg.date)),
  };
}

export const parseSMSAI = async (appContext: IAppContext, msg: any) => {
  const aiResponse = await analyzeSMS(appContext, msg.body)
  const data = JSON.parse(aiResponse);
  return {
    id: msg._id,
    body: msg.body,
    amount: data.amount,
    type: data.type,
    date: data.date ? new Date(data.date) : new Date(Number(msg.date)),
  }
}

export async function getTransactionsFromSMS(appContext: IAppContext): Promise<any[]> {
  return new Promise((resolve, reject) => {
    SmsAndroid.list(
      JSON.stringify({
        box: 'inbox',
        maxCount: 10,
        minDate: 1749081600000
      }),
      (fail: string) => reject(fail),
      async (count: number, smsList: string) => {
        const messages = JSON.parse(smsList);
        const expenses = [];
        for (let message of messages) {
          expenses.push(await parseSMSAI(appContext, message));
        }
        resolve(expenses);
      }
    );
  });
}

export const onSMSRecieved = async (msg: string) => {
  console.log("SMS Received: ", msg);
  const expense = await parseSMSAI(appContext, JSON.parse(msg))
  if (expense?.type && [].incldues(expense.type)) {


  }

}

export const syncMessages = async (appContext: IAppContext) => {
  console.log("Syncing messages from SMS...");
  const granted = await requestSMSPermission();
  if (granted) {
    const transanctions = await getTransactionsFromSMS(appContext);
    await addTransaction(transanctions);
    console.log("Synced Messages.")
  } else {
    console.warn("SMS permission not granted");
  }
}

