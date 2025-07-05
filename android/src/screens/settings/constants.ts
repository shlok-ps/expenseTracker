import { AIDetails } from "src/context/AppContext";
import Constants from 'expo-constants';
import { ExtraEnv } from 'src/types/env';

const { PC_OLLAMA_URL, SERVER_OLLAMA_URL } = Constants.expoConfig?.extra as ExtraEnv;

enum AIType {
  OLLAMA,
  OpenAI
}

export const AIOptions: AIDetails[] = [
  {
    label: 'Rpi Server',
    value: "RPI_SERVER",
    type: AIType.OLLAMA,
    baseURL: SERVER_OLLAMA_URL || "http://shlok-rpi.local:11434/api/generate",
    model: "llama3.2"
  },
  {
    label: "ChatGPT",
    value: "CHATGPT",
    type: AIType.OpenAI,
    baseURL: "https://api.openai.com/v1/chat/completions",
    model: "o3-mini",
    disabled: true,
  },
  {
    label: "Shlok Dell",
    value: "OLLAMA",
    type: AIType.OLLAMA,
    baseURL: PC_OLLAMA_URL || "http://debian.local:11434/api/generate",
    model: 'llama3.2'
  },
]
