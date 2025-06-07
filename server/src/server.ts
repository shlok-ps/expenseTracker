import { ApolloServer } from 'apollo-server'
import { readFileSync } from 'fs'
import { transactionResolvers } from 'src/graphql/resolvers/transaction'
import { context } from './context'
import { join } from 'path'
import { config } from 'dotenv'
import { dateScalarResolver } from './graphql/scalars/dateScalar'

config()

const typeDefs = readFileSync(join(__dirname, 'graphql/schema.graphql'), 'utf-8')

const server = new ApolloServer({
  typeDefs,
  resolvers: [transactionResolvers, dateScalarResolver],
  context
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})

