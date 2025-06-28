import api from './axiosClient'
import { removeTokens, storeTokens } from '../utils/auth'
import { router } from 'expo-router'; // Adjust the import based on your router setup
import { useMutation } from 'react-query';
import { Alert } from 'react-native';

export const useLogin = (onSuccess?: () => void) => {
  return useMutation(async ({ email, password }: { email: string, password: string }) => {
    const res = await api.post('', {
      query: `
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            accessToken
            refreshToken
          }
        }
      `,
      variables: { email, password }
    })
    const { accessToken, refreshToken } = res.data.data.login
    await storeTokens(accessToken, refreshToken)
  }, {
    onSuccess, onError: (err) => {
      Alert.alert('Login failed', (err as any).message || 'Unknown error')
    }
  })
}
export const logout = async () => {
  router.push('/login');
  await removeTokens();
}

export const signup = async (email: string, password: string) => {
  const res = await api.post('', {
    query: `
      mutation Signup($email: String!, $password: String!) {
        signup(email: $email, password: $password) {
          accessToken
          refreshToken
        }
      }
    `,
    variables: { email, password }
  })
  const { accessToken, refreshToken } = res.data.data.signup
  await storeTokens(accessToken, refreshToken)
}

