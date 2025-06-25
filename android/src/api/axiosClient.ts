import axios from 'axios'
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from '../utils/auth'
import { router } from 'expo-router'; // Adjust the import based on your router setup

const baseURL = 'http://192.168.29.144:4000/graphql'
// const baseURL = 'http://shlok-rpi.local:4000/graphql'

const api = axios.create({
  baseURL: baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async config => {
  const token = await getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const refreshToken = async (obj: any) => {
  const original = obj.config
  try {
    const refreshToken = await getRefreshToken()
    console.log('Refreshing token', refreshToken)
    const resp = await axios.post(baseURL, {
      query: `
            mutation Refresh($token: String!) {
              refreshToken(token: $token) {
                accessToken
                refreshToken
              }
            }
          `,
      variables: { token: refreshToken }
    })

    const { accessToken, refreshToken: newRefresh } = resp.data.data.refreshToken
    await storeTokens(accessToken, newRefresh)
    original.headers.Authorization = `Bearer ${accessToken}`
    return api(original)
  } catch {
    await clearTokens()
    router.push('/login') // Assuming you have a router instance to navigate
    // optionally: navigate to login
  }
}

api.interceptors.response.use(
  res => {
    const original = res.config
    if (res.data.errors?.[0]?.extensions.code == 'UNAUTHENTICATED' && !original._retry) {
      original._retry = true
      refreshToken(res)
    }
    if (res.data.errors?.length > 0) {
      console.error('GraphQL Error:', res.data.errors);
      throw new Error(res.data.errors[0].message)
    }
    return res
  },
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      refreshToken(err)
    }
    return Promise.reject(err)
  }
)

export default api

