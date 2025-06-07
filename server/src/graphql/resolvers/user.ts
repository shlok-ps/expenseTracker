import { hashPassword, comparePasswords, generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/auth'

export const userResolvers = {
  Mutation: {
    signup: async (_: any, { email, password }: any, { prisma }: any) => {
      const hashed = await hashPassword(password)
      const user = await prisma.user.create({
        data: { email, password: hashed }
      })
      const accessToken = generateAccessToken(user.id)
      const refreshToken = generateRefreshToken(user.id)
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
      })
      return { accessToken, refreshToken }
    },
    login: async (_: any, { email, password }: any, { prisma }: any) => {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) throw new Error('User not found')
      const valid = await comparePasswords(password, user.password)
      if (!valid) throw new Error('Invalid password')
      const accessToken = generateAccessToken(user.id)
      const refreshToken = generateRefreshToken(user.id)

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
      })

      return { accessToken, refreshToken }
    },
    refreshToken: async (_: any, { token }: any, { prisma }: any) => {
      try {
        const payload = verifyRefreshToken(token) as { userId: string }
        const user = await prisma.user.findUnique({ where: { id: payload.userId } })
        if (!user || user.refreshToken !== token) throw new Error('Invalid refresh token')

        const newAccessToken = generateAccessToken(user.id)
        const newRefreshToken = generateRefreshToken(user.id)

        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: newRefreshToken }
        })

        return { accessToken: newAccessToken, refreshToken: newRefreshToken }
      } catch {
        throw new Error('Token expired or invalid')
      }
    }
  }
}

