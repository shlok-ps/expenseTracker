import React, { createContext, useContext, useState, useRef } from 'react';
import Toast from 'react-native-toast-message';
import { useCreateTransactionMutation } from 'src/api/transactions';
import { useAppContext } from 'src/context/AppContext';
import { analyseAndSaveSMSToServer, getSMSListFromLastSyncedDate, IMessage } from 'src/services/sms/helper';

interface SyncContextType {
  isSyncing: boolean;
  progress: number;
  startSync: () => void;
  stopSync: () => void;
}

const SyncContext = createContext<SyncContextType>({
  isSyncing: false,
  progress: 0,
  startSync: () => { },
  stopSync: () => { },
});

export const useSync = () => useContext(SyncContext);

export const MAX_SMS_COUNT = 5; // Maximum number of SMS to fetch in one go

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const stopFlagRef = useRef(false);
  const appContext = useAppContext();
  const { mutateAsync: addTransactionsToServer } = useCreateTransactionMutation();

  const syncIthBatch = async (allSMSList: IMessage[], i: number) => {
    const smsList = allSMSList.slice(i * MAX_SMS_COUNT, i * MAX_SMS_COUNT + MAX_SMS_COUNT)
    await analyseAndSaveSMSToServer(appContext.state.aiDetails, addTransactionsToServer, smsList);
  }

  const startSync = async () => {
    setIsSyncing(true);
    setProgress(0);
    let i = 0;
    const allSMSList = await getSMSListFromLastSyncedDate()
    stopFlagRef.current = false;
    const totalProgressCount = allSMSList.length / MAX_SMS_COUNT;
    // const totalProgressCount = 100;
    const processStep = async () => {
      if (i < totalProgressCount) {
        if (stopFlagRef.current) {
          setIsSyncing(false);
          return;
        }
        const percentage = Math.round(((i + 1) / totalProgressCount) * 100);
        await syncIthBatch(allSMSList, i)
        setProgress(percentage);
        i++;
        setTimeout(processStep, 10); // Adjust time for smoother/slower updates
      } else {
        setIsSyncing(false);
      }
    };
    processStep();
  };

  const stopSync = () => {
    stopFlagRef.current = true;
  };

  return (
    <SyncContext.Provider value={{ isSyncing, progress, startSync, stopSync }}>
      {children}
    </SyncContext.Provider>
  );
};

