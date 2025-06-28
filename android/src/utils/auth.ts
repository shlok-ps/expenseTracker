import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

export const storeTokens = async (accessToken: string, refreshToken: string) => {
  await AsyncStorage.setItem('accessToken', accessToken)
  await AsyncStorage.setItem('refreshToken', refreshToken)
}

export const removeTokens = async () => {
  await AsyncStorage.removeItem('accessToken')
  await AsyncStorage.removeItem('refreshToken')
}

export const getAccessToken = async () => await AsyncStorage.getItem('accessToken')
export const getRefreshToken = async () => await AsyncStorage.getItem('refreshToken')

export const clearTokens = async () => {
  await AsyncStorage.removeItem('accessToken')
  await AsyncStorage.removeItem('refreshToken')
}

export const useAuth = () => {
  const [authChecked, setAuthChecked] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    getAccessToken().then(token => {
      setAuthenticated(!!token)
      setAuthChecked(true)
    })
  }, [])

  return { authChecked, authenticated }
}

