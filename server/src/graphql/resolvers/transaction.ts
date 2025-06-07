import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const transactionResolvers = {
  Query: {
    transactions: () => prisma.transaction.findMany(),
  },
  Mutation: {
    addTransaction: async (_: any, args: any) => {
      return prisma.transaction.create({ data: args })
    },
    flagDuplicate: async (_: any, { id, value }: any) => {
      return prisma.transaction.update({
        where: { id },
        data: { isDuplicate: value }
      })
    }
  }
}

