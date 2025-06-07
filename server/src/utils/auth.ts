import { sign, verify } from 'jsonwebtoken'
import { hash, compare } from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export const hashPassword = async (password: string) =>
  await hash(password, 10)

export const comparePasswords = async (plain: string, hashed: string) =>
  await compare(plain, hashed)

export const generateToken = (userId: string) =>
  sign({ userId }, JWT_SECRET, { expiresIn: '7d' })

export const verifyToken = (token: string) =>
  verify(token, JWT_SECRET)

