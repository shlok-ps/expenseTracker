import api from './axiosClient'
import { storeTokens } from '../utils/auth'

export const login = async (email: string, password: string) => {
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

