import { createContext, useContext, useState } from "react";

export interface IAppContext { AI_BASE_URL: string, model: string }

const AppContext = createContext<IAppContext>({ AI_BASE_URL: "http://192.168.29.144:11434", model: 'llama3.2' });

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState({
    AI_BASE_URL: "http://192.168.29.144:11434",
    model: 'llama3.2'
  });
  return (<AppContext.Provider value={state}>
    {children}
  </AppContext.Provider>);
}

export const useAppContext = () => useContext(AppContext);
