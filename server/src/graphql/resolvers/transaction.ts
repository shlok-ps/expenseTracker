export const transactionResolvers = {
  Query: {
    transactions: (_: any, __: any, { prisma, userId }: any) => {
      if (!userId) throw new Error('Not authenticated')
      return prisma.transaction.findMany({ where: { userId } })
    },
  },
  Mutation: {
    addTransaction: (_: any, args: any, { prisma, userId }: any) => {
      if (!userId) throw new Error('Not authenticated')
      return prisma.transaction.create({
        data: {
          ...args,
          user: {
            connect: {
              id: userId
            }
          }
        }
      })
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

