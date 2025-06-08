import { AuthenticationError } from "apollo-server"

export const transactionResolvers = {
  Query: {
    transactions: (_: any, __: any, { prisma, userId }: any) => {
      if (!userId) throw new AuthenticationError("Not Authenticated 2");
      return prisma.transaction.findMany({ where: { userId } })
    },
  },
  Mutation: {
    addTransaction: async (_: any, args: any, { prisma, userId }: any) => {
      if (!userId) throw new AuthenticationError("Not Authenticated");

      const userDetails = await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          transactions: {
            createMany: {
              data: args.transactions,
              skipDuplicates: true
            }
          }
        },
        select: {
          transactions: true
        },
      })
      console.log("Added transactions: ", userDetails.transactions)
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

