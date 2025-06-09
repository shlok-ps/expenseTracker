import React, { createContext, useContext, useState, useRef } from 'react';
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
  const { mutate: addTransactionsToServer } = useCreateTransactionMutation();

  const startSync = async () => {
    const allSMSList = await getSMSListFromLastSyncedDate()
    setIsSyncing(true);
    setProgress(0);
    stopFlagRef.current = false;

    //const allSMSList = [{ _id: "1" }, { _id: "2" }, { _id: "3" }, { _id: "4" }, { _id: "5" }, { _id: "6" }, { _id: "7" }, { _id: "8" }, { _id: "9" }, { _id: "10" }, { _id: "11" }, { _id: "12" }, { _id: "13" }, { _id: "14" }, { _id: "15" }, { _id: "16" }]; // Mock data for testing

    const totalProgressCount = allSMSList.length / MAX_SMS_COUNT;
    for (let i = 0; i < totalProgressCount; i++) {
      console.log('syncing', i, 'of', totalProgressCount);
      if (stopFlagRef.current) break;
      const smsList = allSMSList.slice(i * MAX_SMS_COUNT, i * MAX_SMS_COUNT + MAX_SMS_COUNT)
      console.log("Syncing SMS batch: ", smsList);
      await analyseAndSaveSMSToServer(appContext, addTransactionsToServer, smsList);
      setProgress(Math.round(((i + 1) / totalProgressCount) * 100));
    }
    setIsSyncing(false);
  };

  const stopSync = () => {
    stopFlagRef.current = true;
    setIsSyncing(false);
  };

  return (
    <SyncContext.Provider value={{ isSyncing, progress, startSync, stopSync }}>
      {children}
    </SyncContext.Provider>
  );
};

