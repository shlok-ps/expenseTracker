import { ITransaction } from 'src/database/transactions'
import api from './axiosClient'

export const createTransaction = async (data: ITransaction[]) => {
  const res = await api.post('', {
    query: `
      mutation CreateTransaction($data: CreateTransactionInput!) {
        createTransaction(data: $data) {
          id
          amount
          type
          category
          date
          description
        }
      }
    `,
    variables: { data }
  })
  return res.data.data.createTransaction
}

export const getTransactions = async () => {
  const res = await api.post('', {
    query: `
      query {
        transactions {
          id
          amount
          type
          category
          date
          description
          isDuplicate
        }
      }
    `
  })
  return res.data.data.transactions as ITransaction[]
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

