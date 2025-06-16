import React, { useState } from 'react'
import { View, TextInput, Button, Alert } from 'react-native'
import { login } from '../api/auth'
import { router } from 'expo-router'

export default function LoginScreen({ }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    try {
      await login(email, password)
      router.push('/(tabs)')
    } catch (err) {
      Alert.alert('Login failed', (err as any).message || 'Unknown error')
    }
  }

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
    </View>
  )
}

