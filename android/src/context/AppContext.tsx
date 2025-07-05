import React, { createContext, useContext, useState } from "react";
import { AIOptions } from "src/screens/settings/constants";

export enum AIType {
  OLLAMA,
  OpenAI
}
export interface AIDetails { baseURL: string, model: string, label: string, value: string, type: AIType, disabled?: boolean }
export interface IAppContext { aiDetails: AIDetails, setAIDetails: React.Dispatch<React.SetStateAction<AIDetails>> }

const AppContext = createContext<{
  state: IAppContext
}>({
  state: {
    aiDetails: AIOptions[0],
    setAIDetails: () => { }
  },
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [aiDetails, setAIDetails] = useState(AIOptions[0]);
  return (<AppContext.Provider value={{
    state: {
      aiDetails,
      setAIDetails
    }
  }}>
    {children}
  </AppContext.Provider>);
}

export const useAppContext = () => useContext(AppContext);
