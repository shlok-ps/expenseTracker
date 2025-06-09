import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useDeleteTransactionMutation, useGetTransactions, useUpdateTransactionMutation } from 'src/api/transactions';
import { useTheme } from 'src/context/ThemeContext';
import { TransactionType } from 'src/types/transaction';

export default function TransactionDetail() {
  const { id } = useLocalSearchParams();
  const { data: transactions } = useGetTransactions(id as string)
  const { mutate: deleteTransaction } = useDeleteTransactionMutation()
  const { mutate: updateTransaction } = useUpdateTransactionMutation()
  const transaction = transactions?.[0];
  const router = useRouter();
  const { theme } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [editCategory, setEditCategory] = useState(transaction?.category || '');
  const [editType, setEditType] = useState(transaction?.type || 'debit');

  if (!transaction) return <Text>Transaction not found</Text>;

  const handleDelete = () => {
    Alert.alert('Delete?', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTransaction(transaction.id)
        },
      },
    ]);
  };

  const handleSave = () => {
    updateTransaction({
      ...transaction,
      category: editCategory,
      type: editType
    });

    setModalVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.amount, { color: transaction?.type === TransactionType.CREDIT ? theme.green : theme.red }]}>
        ₹{transaction.amount}
      </Text>

      <Text style={styles.label}>Category</Text>
      <Text style={[styles.value, { color: theme.text }]}>{transaction.category}</Text>

      <Text style={styles.label}>Type</Text>
      <Text style={[styles.value, { color: theme.text }]}>{transaction.type}</Text>

      <Text style={styles.label}>Date</Text>
      <Text style={[styles.value, { color: theme.text }]}>{new Date(transaction.date).toLocaleString()}</Text>

      <Text style={styles.label}>SMS</Text>
      <Text style={[styles.value, { color: theme.text }]}>{transaction.smsBody}</Text>

      <View style={styles.buttonRow}>
        <Pressable style={[styles.button, { backgroundColor: theme.blue }]} onPress={() => setModalVisible(true)}>
          <Text style={[styles.buttonText, { color: theme.background }]}>Edit</Text>
        </Pressable>
        <Pressable style={[styles.button, { backgroundColor: theme.red }]} onPress={handleDelete}>
          <Text style={[styles.buttonText, { color: theme.background }]}>Delete</Text>
        </Pressable>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={[styles.modalView, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.text }]}>Edit Transaction</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.text }]}
            value={editCategory}
            onChangeText={setEditCategory}
            placeholder="Category"
            placeholderTextColor={theme.subtle}
          />
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.text }]}
            value={editType}
            onChangeText={setEditType}
            placeholder="Type (credit/debit)"
            placeholderTextColor={theme.subtle}
          />
          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, { backgroundColor: theme.green }]} onPress={handleSave}>
              <Text style={[styles.buttonText, { color: theme.background }]}>Save</Text>
            </Pressable>
            <Pressable style={[styles.button, { backgroundColor: theme.red }]} onPress={() => setModalVisible(false)}>
              <Text style={[styles.buttonText, { color: theme.background }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, minHeight: '100%' },
  amount: { fontSize: 36, fontWeight: 'bold', marginBottom: 20 },
  label: { marginTop: 10, fontSize: 14, fontWeight: '600' },
  value: { fontSize: 16, marginBottom: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  button: { padding: 12, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  buttonText: { fontWeight: '600' },
  modalView: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
});

