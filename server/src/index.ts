import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import typeConfig from "./configs/type-orm.config";
import {PostResolver} from "./resolvers/post";
import {UserResolver} from "./resolvers/user";
import session from "express-session";
import {__prod__, COOKIE_NAME} from "./constants";
import {createConnection} from 'typeorm'
import {newUserLoader} from "./utils/newUserLoader";
import connectRedis from 'connect-redis'
import {Redis} from "ioredis";
import {newUpdootLoader} from "./utils/newUpdootLoader";

const main = async () => {
    await createConnection(typeConfig)

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver],
            validate: false
        }),
        context: ({req, res}) => ({
            req,
            res,
            redis: null,
            userLoader: newUserLoader(),
            updootLoader: newUpdootLoader()
        })
    })

    await apolloServer.start()

    const app = express()

    const RedisStore = connectRedis(session)
    const redis = new Redis()

    // Cross-Origin Resource Sharing
    app.use(cors({
        origin: [
            'http://localhost:3000',
            'https://studio.apollographql.com'
        ],
        credentials: true
    }))

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
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

    apolloServer.applyMiddleware({app, cors: false})

    app.listen(4000, () => {
        console.log('Server started on localhost:4000')
    })
}

main().catch(err => {
    console.log(err)
})
