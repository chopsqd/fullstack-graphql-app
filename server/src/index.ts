import 'reflect-metadata'
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import {MikroORM} from '@mikro-orm/postgresql'
import mikroConfig from "./mikro-orm.config";
import {PostResolver} from "./resolvers/post";

const main = async () => {
    const orm = await MikroORM.init(mikroConfig)
    await orm.getMigrator().up()

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver],
            validate: false
        }),
        context: () => ({ em: orm.em })
    })

    await apolloServer.start()

    const app = express()

    apolloServer.applyMiddleware({ app })

    app.listen(4000, () => {
        console.log('Server started on localhost:4000')
    })
}

main().catch(err => {
    console.log(err)
})
