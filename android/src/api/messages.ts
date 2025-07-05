import { IMessage } from "src/services/sms/helper"
import api from "./axiosClient"
import { useMutation } from "react-query"
import Toast from "react-native-toast-message"

const queueMessages = async (data: IMessage[]) => {
  const res = await api.post('', {
    query: `
      mutation ParseMyMessage($data: [IMessage!]!) {
        parseMessages(messages: $data)
      }
    `,
    variables: { data }
  })
  return res.data.data
}

export const useQueueMessages = () => {
  return useMutation(queueMessages, {
    onSuccess: (data) => {
      Toast.show({
        type: 'success',
        text1: data?.parseMessages || "Messages queued successfully",
      })
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: "Error Queuing Messages",
      })
    }
  })
}
