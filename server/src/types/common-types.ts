import {Connection, EntityManager, IDatabaseDriver} from "@mikro-orm/core";
import {Request, Response} from 'express'
import {Redis} from 'ioredis'

export type AppContext = {
    em:  EntityManager<IDatabaseDriver<Connection>>
    req: Request  & {session: Express.SessionStore & {userId: number}}
    redis: Redis
    res: Response
}
