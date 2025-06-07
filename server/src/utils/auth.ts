import { sign, verify } from 'jsonwebtoken'
import { hash, compare } from 'bcryptjs'

const ACCESS_SECRET = process.env.JWT_SECRET || 'access-secret'
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret'

export const hashPassword = async (password: string) => hash(password, 10)
export const comparePasswords = async (plain: string, hashed: string) => compare(plain, hashed)

export const generateAccessToken = (userId: string) =>
  sign({ userId }, ACCESS_SECRET, { expiresIn: '15m' })

export const generateRefreshToken = (userId: string) =>
  sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' })

export const verifyAccessToken = (token: string) => verify(token, ACCESS_SECRET)
export const verifyRefreshToken = (token: string) => verify(token, REFRESH_SECRET)
