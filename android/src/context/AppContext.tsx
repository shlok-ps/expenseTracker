import React, { createContext, useContext, useState } from "react";

export interface IAppContext { AI_BASE_URL: string, model: string, value: string }

const AppContext = createContext<{
  state: IAppContext, setState: React.Dispatch<React.SetStateAction<IAppContext>>
}>({ state: { AI_BASE_URL: "http://192.168.29.144:11434/api/generate", model: 'llama3.2', value: 'OLLAMA' }, setState: () => { } });

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState({
    AI_BASE_URL: "http://192.168.29.144:11434/api/generate",
    model: 'llama3.2',
    value: 'OLLAMA'
  });
  return (<AppContext.Provider value={{ state, setState }}>
    {children}
  </AppContext.Provider>);
}

export const useAppContext = () => useContext(AppContext);
