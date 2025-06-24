import { AIDetails } from "src/context/AppContext";

enum AIType {
  OLLAMA,
  OpenAI
}

export const AIOptions: AIDetails[] = [
  {
    label: 'Rpi Server',
    value: "RPI_SERVER",
    type: AIType.OLLAMA,
    baseURL: "http://shlok-rpi.local:11434/api/generate",
    model: "llama3.2"
  },
  {
    label: "ChatGPT",
    value: "CHATGPT",
    type: AIType.OpenAI,
    baseURL: "https://api.openai.com/v1/chat/completions",
    model: "o3-mini"
  },
  {
    label: "Shlok Dell",
    value: "OLLAMA",
    type: AIType.OLLAMA,
    baseURL: "http://debian.local:11434/api/generate",
    model: 'llama3.2'
  },
]
