import {Request, Response} from 'express'
import {Redis} from 'ioredis'

export type AppContext = {
    req: Request  & {session: Express.SessionStore & {userId: number}}
    redis: Redis
    res: Response
}
