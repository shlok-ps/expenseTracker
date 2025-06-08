import { useEffect } from "react"
import { onSMSRecieved, syncMessages } from './services/sms/helper'
import { DeviceEventEmitter } from "react-native"
import { useAppContext } from "./AppContext"

export const useAppInit = () => {
  const appContext = useAppContext();

  useEffect(() => {
    DeviceEventEmitter.addListener('sms_onDelivery', onSMSRecieved);
    syncMessages(appContext)
  }, [])
}
