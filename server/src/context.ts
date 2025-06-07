import { PrismaClient } from '@prisma/client'
import { verifyAccessToken } from './utils/auth'
import { Request } from 'express';

export const prisma = new PrismaClient()

export interface Context {
  prisma: PrismaClient
  userId?: string
}

export const context: Context = {
  prisma
}

export const createContext = ({ req }: { req: Request }): Context => {
  const auth = req.headers.authorization
  if (auth) {
    try {
      const token = auth.replace('Bearer ', '')
      const decoded = verifyAccessToken(token) as { userId: string }
      return { prisma, userId: decoded.userId }
    } catch (e) {
      return { prisma }
    }
  }
  return { prisma }
}
