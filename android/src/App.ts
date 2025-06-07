import { useEffect } from "react"
import { onSMSRecieved, requestSMSPermission, syncMessages } from './services/sms/helper'
import { getTransactionsFromSMS } from './services/sms/helper'
import { DeviceEventEmitter } from "react-native"

export const useAppInit = () => {
  useEffect(() => {
    DeviceEventEmitter.addListener('sms_onDelivery', onSMSRecieved);
    syncMessages()
  }, [])
}
