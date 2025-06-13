export const AIOptions = [
  {
    label: "ChatGPT",
    value: "CHATGPT",
    baseURL: "https://api.openai.com/v1/chat/completions",
    model: "o3-mini"
  },
  {
    label: "Local Ollama",
    value: "OLLAMA",
    baseURL: "http://192.168.29.144:11434/api/generate",
    model: 'llama3.2'
  }
]
