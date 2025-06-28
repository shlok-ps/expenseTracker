import { router } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useTheme } from 'src/context/ThemeContext'
import { useLogin } from '../api/auth'

export default function LoginScreen({ }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const theme = useTheme().theme;
  const { mutate: login, isLoading } = useLogin(() => {
    router.push('/(tabs)')
  });

  const handleLogin = () => {
    login({ email, password })
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={require('../assets/logo.png')} style={{ width: '100%', marginVertical: 30 }} />
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={theme.subtle} style={{ color: theme.text }} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry placeholderTextColor={theme.subtle} style={{ color: theme.text }} />
      <TouchableOpacity onPress={handleLogin} style={[styles.loginButton, { backgroundColor: theme.surface }]}>
        {
          isLoading ? (
            <ActivityIndicator color={theme.text} />
          ) : (
            <Text style={{ color: theme.text, textAlign: 'center', fontWeight: '400', fontSize: 18 }}>Login</Text>
          )
        }
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loginButton: {
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }

})
