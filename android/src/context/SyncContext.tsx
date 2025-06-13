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

  const startSync = async () => {
    try {
      setIsSyncing(true);
      setProgress(0);
      const allSMSList = await getSMSListFromLastSyncedDate()
      console.log('allSMSList: ', allSMSList.length);
      stopFlagRef.current = false;

      const totalProgressCount = allSMSList.length / MAX_SMS_COUNT;
      for (let i = 0; i < totalProgressCount; i++) {
        const percentage = Math.round(((i + 1) / totalProgressCount) * 100);
        console.log('syncing', i, 'of', totalProgressCount, ' --- percentage: ', percentage);
        if (stopFlagRef.current) break;
        await (async () => {
          const smsList = allSMSList.slice(i * MAX_SMS_COUNT, i * MAX_SMS_COUNT + MAX_SMS_COUNT)
          await analyseAndSaveSMSToServer(appContext.state, addTransactionsToServer, smsList);
          setProgress(percentage);
        })()
      }
    } catch (e) {
      console.error('Error In Sync:', e);
      Toast.show({
        type: 'error',
        text1: 'We were unable to sync.',
        visibilityTime: 5000
      });
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

