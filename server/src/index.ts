import 'reflect-metadata'
import express from 'express'
import redis from 'redis'
import session from 'express-session'
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import {MikroORM} from '@mikro-orm/postgresql'
import mikroConfig from "./mikro-orm.config";
import {PostResolver} from "./resolvers/post";
import {UserResolver} from "./resolvers/user";
import connectRedis from 'connect-redis'
import {__prod__} from "./constants";
import {AppContext} from "./types";

const main = async () => {
    const orm = await MikroORM.init(mikroConfig)
    await orm.getMigrator().up()

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver],
            validate: false
        }),
        context: ({req, res}): AppContext => ({em: orm.em, req, res})
    })

    await apolloServer.start()

    const app = express()

    const RedisStore = connectRedis(session)
    const redisClient = redis.createClient()

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({
                client: redisClient,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
                sameSite: 'lax', // csrf
                secure: __prod__ // cookie only works in https
            },
            saveUninitialized: false,
            secret: 'cat',
            resave: false
        })
    )

    apolloServer.applyMiddleware({app})

    app.listen(4000, () => {
        console.log('Server started on localhost:4000')
    })
}

main().catch(err => {
    console.log(err)
})
