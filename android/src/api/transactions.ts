import { ITransaction } from 'src/types/transaction';
import api from './axiosClient'
import { useMutation, useQuery, useQueryClient } from 'react-query';

const createTransaction = async (data: ITransaction[]) => {
  const res = await api.post('', {
    query: `
      mutation CreateTransaction($data: [AddTransactionItem!]!) {
        addTransaction(transactions: $data) {
          id
        }
      }
    `,
    variables: { data }
  })
  return res.data.data.addTransaction
}

export const useCreateTransactionMutation = () => {
  const qc = useQueryClient();
  return useMutation((data: ITransaction[]) => createTransaction(data), {
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['TRANSACTIONS']
      })
    },
  })
}

const getTransactions = async (id?: string) => {
  const res = await api.post('', {
    query: id ? `
      query getTransactions($id: String) {
        transactions(id: $id) {
          id
          amount
          type
          category
          date
          sourceDateTime
          description
          isDuplicate
          fromAccount
          toAccount
          smsBody
        }
      }
    `: `
      query {
        transactions {
          id
          amount
          type
          category
          date
          sourceDateTime
          description
          fromAccount
          toAccount
        }
      }
    `,
    variables: { id }
  })
  return res.data.data?.transactions as ITransaction[]
}

export const useGetTransactions = (id?: string) => {
  return useQuery(['TRANSACTIONS', id], () => getTransactions(id))
}

export const updateTransaction = async (id: string, data: any) => {
  const res = await api.post('', {
    query: `
      mutation UpdateTransaction($id: String!, $data: UpdateTransactionInput!) {
        updateTransaction(id: $id, data: $data) {
          id
          amount
          category
          date
          description
        }
      }
    `,
    variables: { id, data }
  })
  return res.data.data.updateTransaction
}

export const useUpdateTransactionMutation = () => {
  const qc = useQueryClient();
  return useMutation((data: any) => updateTransaction(data.id, data.data), {
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['TRANSACTIONS']
      })
    }
  })
}

export const deleteTransaction = async (id: string) => {
  const res = await api.post('', {
    query: `
      mutation DeleteTransaction($id: String!) {
        deleteTransaction(id: $id)
      }
    `,
    variables: { id }
  })
  return res.data.data.deleteTransaction
}

export const useDeleteTransactionMutation = () => {
  const qc = useQueryClient();
  return useMutation((id: string) => deleteTransaction(id), {
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['TRANSACTIONS']
      })
    }
  })
}
