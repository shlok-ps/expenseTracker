import axios from 'axios'
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from '../utils/auth'

const api = axios.create({
  baseURL: 'http://192.168.29.144:4000/graphql',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async config => {
  const token = await getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = await getRefreshToken()
        const resp = await axios.post('http://192.168.29.144:4000/graphql', {
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
        // optionally: navigate to login
      }
    }
    return Promise.reject(err)
  }
)

export default api

