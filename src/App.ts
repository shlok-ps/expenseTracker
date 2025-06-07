import { useEffect } from "react"
import { requestSMSPermission } from './services/sms/helper'
import { getTransactionsFromSMS } from './services/sms/helper'
import { DeviceEventEmitter } from "react-native"

export const useAppInit = () => {
  useEffect(() => {
    console.log("App Init useEffect");
    DeviceEventEmitter.addListener('sms_onDelivery', (msg) => {
      console.log(msg);
    });
    (async () => {
      const granted = await requestSMSPermission();
      if (granted) {
        const transanctions = await getTransactionsFromSMS();
        console.log("Transactions From SMS: ", transanctions);
      }
    })()
  }, [])
}
