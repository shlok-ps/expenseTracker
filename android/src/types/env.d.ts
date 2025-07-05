export interface ExtraEnv {
  API_URL: string;
  APP_ENV: 'development' | 'staging' | 'production';
  SERVER_OLLAMA_URL: string;
  PC_OLLAMA_URL: string;
}
