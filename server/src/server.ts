import { ApolloServer } from 'apollo-server'
import { readFileSync } from 'fs'
import { transactionResolvers } from 'app/resolvers/transaction'
import { context, createContext } from './context'
import { join } from 'path'
import { config } from 'dotenv'
import { dateScalarResolver } from 'app/scalars/dateScalar'
import { userResolvers } from 'app/resolvers/user'
import { parseSMSResolver } from 'app/resolvers/parseSMS'

config()

const typeDefs = readFileSync(join(__dirname, 'app/schema.graphql'), 'utf-8')

const server = new ApolloServer({
  typeDefs,
  resolvers: [transactionResolvers, dateScalarResolver, userResolvers, parseSMSResolver],
  context: createContext
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})

