import 'dotenv/config';

export default {
  expo: {
    android: {
      package: 'com.anonymous.expensetracker',
    },
    ios: {
      bundleIdentifier: 'com.anonymous.expensetracker',
    },
    plugins: ['expo-router'],
    extra: {
      API_URL: process.env.API_URL,
      PC_OLLAMA_URL: process.env.PC_OLLAMA_URL,
      SERVER_OLLAMA_URL: process.env.SERVER_OLLAMA_URL,
    },
  },
};

