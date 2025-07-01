import { AuthenticationError } from "apollo-server"
import { ITransaction } from "./types";

export const transactionResolvers = {
  Query: {
    transactions: (_: any, args: any, { prisma, userId }: any) => {
      if (!userId) throw new AuthenticationError("Not Authenticated 2");
      return prisma.transaction.findMany({
        where: { userId, id: args?.id ?? undefined },
        orderBy: {
          sourceDateTime: 'desc'
        }
      })
    },
  },
  Mutation: {
    addTransaction: async (_: any, args: { transactions: ITransaction[] }, { prisma, userId }: any) => {
      if (!userId) throw new AuthenticationError("Not Authenticated");
      console.log("saving Transactions: ", args.transactions.map(t => t.id))

      const userDetails = await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          transactions: {
            createMany: {
              data: args.transactions.map(t => ({
                ...t,
                id: userId + '_' + t.id, // Ensure unique ID per user
              })),
              skipDuplicates: true
            }
          }
        },
        select: {
          transactions: true
        },
      })
      return userDetails.transactions
    },
    flagDuplicate: (_: any, { id, value }: any, { prisma, userId }: any) => {
      if (!userId) throw new Error('Not authenticated')
      return prisma.transaction.update({
        where: { id },
        data: { isDuplicate: value }
      })
    }
  }
}

