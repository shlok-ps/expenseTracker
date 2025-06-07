import { Platform, PermissionsAndroid } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';


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

export async function getTransactionsFromSMS(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    SmsAndroid.list(
      JSON.stringify({
        box: 'inbox',
        maxCount: 100,
      }),
      (fail) => reject(fail),
      (count, smsList) => {
        const messages = JSON.parse(smsList);
        const expenses = messages.map(parseSMS).filter(Boolean);
        resolve(expenses);
      }
    );
  });
}
