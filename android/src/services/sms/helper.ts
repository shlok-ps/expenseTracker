import { Platform, PermissionsAndroid, Alert } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import { analyzeSMS } from '../ai';
import { AIDetails, IAppContext } from 'src/context/AppContext';
import { ITransaction } from 'src/types/transaction';
import { TransactionType } from 'src/types/transaction';
import AsyncStorage from '@react-native-async-storage/async-storage';


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

export const parseSMSRegEx = (msg: any) => {
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

export const parseSMSAI = async (appContext: AIDetails, msg: IMessage): Promise<ITransaction> => {
  const aiResponse = await analyzeSMS(appContext, msg.body)
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

export interface IMessage {
  _id: string;
  body: string;
  date: number;
  address: string;
}

const getSMSList = (minDate: number): Promise<IMessage[]> => {
  return new Promise((resolve, reject) => {
    const today = new Date();
    const monthStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
    SmsAndroid.list(
      JSON.stringify({
        box: 'inbox',
        minDate: minDate ?? monthStartDate.getTime(),
      }),
      (fail: string) => reject(fail),
      async (_: number, smsList: string) => {
        const messages = JSON.parse(smsList) as IMessage[];
        console.log("Fetched SMS messages: ", messages.length);
        resolve(messages.sort((a, b) => a.date - b.date));
      }
    );
  });
}

export const getLastSyncedDateTime = async () => {
  return Number(await AsyncStorage.getItem('lastSyncDate'))
}

export const saveLastSyncedDateTime = async (date: number) => {
  await AsyncStorage.setItem('lastSyncDate', date.toString())
}

export const onSMSRecieved = async (appContext: AIDetails, msg: string, addTransactionsToServer: Function) => {
  console.log("SMS Received: ", msg);
  const expense = await parseSMSAI(appContext, JSON.parse(msg))
  if (expense?.type && [TransactionType.DEBIT, TransactionType.CREDIT].includes(expense.type)) {
    const res = await addTransactionsToServer([expense]);
    console.log("Saved SMS to Server", res.id)
  }
}

export const getSMSListFromLastSyncedDate = async (): Promise<IMessage[]> => {
  const granted = await requestSMSPermission();
  if (granted) {
    let initialDate = await getLastSyncedDateTime();
    const smsList = await getSMSList(initialDate)
    return smsList
  } else {
    Alert.alert("Permission Denied", "Please grant SMS permission to sync messages.");
    return []
  }
}

export const analyseAndSaveSMSToServer = async (appContext: AIDetails, addTransactionsToServer: Function, smsList: IMessage[], getStopSignal: () => boolean) => {
  const transanctions = [];
  for (let message of smsList) {
    if (!getStopSignal()) {
      const aiRes = await parseSMSAI(appContext, message)
      aiRes.amount && transanctions.push(aiRes);
    } else {
      throw new Error("Sync stopped by user");
    }
  }
  transanctions.length && await addTransactionsToServer(transanctions);
  saveLastSyncedDateTime(smsList[smsList.length - 1].date)
}

