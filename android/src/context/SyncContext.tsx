import React, { createContext, useContext, useState, useRef } from 'react';
import Toast, { ErrorToast } from 'react-native-toast-message';
import { useQueueMessages } from 'src/api/messages';
import { useCreateTransactionMutation } from 'src/api/transactions';
import { useAppContext } from 'src/context/AppContext';
import { analyseAndSaveSMSToServer, getSMSListFromLastSyncedDate, IMessage, saveLastSyncedDateTime } from 'src/services/sms/helper';

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

export const MESSAGE_SYNCING_MODE = 'queue'; // 'queue' or 'AI'
export const MAX_SMS_COUNT = 10; // Maximum number of SMS to fetch in one go

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const stopFlagRef = useRef(false);
  const appContext = useAppContext();
  const { mutateAsync: addTransactionsToServer } = useCreateTransactionMutation();
  const { mutateAsync: queueMessages } = useQueueMessages();

  const syncIthBatch = async (allSMSList: IMessage[], i: number, getStopSignal: () => boolean) => {
    if (MESSAGE_SYNCING_MODE == 'queue') {
      await queueMessages(
        allSMSList
          .slice(i * MAX_SMS_COUNT, i * MAX_SMS_COUNT + MAX_SMS_COUNT)
          .map(sms => ({
            _id: sms._id.toString(),
            address: sms.address,
            body: sms.body,
            date: sms.date
          }))
      );
    } else {
      const smsList = allSMSList.slice(i * MAX_SMS_COUNT, i * MAX_SMS_COUNT + MAX_SMS_COUNT)
      await analyseAndSaveSMSToServer(appContext.state.aiDetails, addTransactionsToServer, smsList, getStopSignal);
    }
    return (allSMSList[i * MAX_SMS_COUNT + MAX_SMS_COUNT - 1] || { date: new Date().getTime() })?.date;
  }

  const startSync = async () => {
    console.log("Starting SMS Sync using AI: ", appContext.state.aiDetails);
    setIsSyncing(true);
    setProgress(0);
    let i = 0;
    const allSMSList = await getSMSListFromLastSyncedDate()
    stopFlagRef.current = false;
    const totalProgressCount = allSMSList.length / MAX_SMS_COUNT;
    const processStep = async () => {
      if (i < totalProgressCount) {
        if (stopFlagRef.current) {
          setIsSyncing(false);
          return;
        }
        console.log(`Processing batch ${i + 1} of ${totalProgressCount}`);
        const percentage = Math.round(((i + 1) / totalProgressCount) * 100);
        try {
          saveLastSyncedDateTime(
            await syncIthBatch(allSMSList, i, () => stopFlagRef.current)
          )
        } catch (error) {
          console.error("Error syncing SMS batch:", error);
          setIsSyncing(false);
          Toast.show({ type: 'error', text1: (error as any).message || 'Failed to sync SMS' });
          return;
        }
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

