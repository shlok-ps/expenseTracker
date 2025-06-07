import { hashPassword, comparePasswords, generateToken } from '../../utils/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const userResolvers = {
  Mutation: {
    signup: async (_: any, { email, password }: any, { prisma }: any) => {
      const hashed = await hashPassword(password)
      const user = await prisma.user.create({
        data: { email, password: hashed }
      })
      const token = generateToken(user.id)
      return { token }
    },
    login: async (_: any, { email, password }: any, { prisma }: any) => {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) throw new Error('User not found')
      const valid = await comparePasswords(password, user.password)
      if (!valid) throw new Error('Invalid password')
      const token = generateToken(user.id)
      return { token }
    }
  }
}

