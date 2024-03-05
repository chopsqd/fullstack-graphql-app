import {Connection, EntityManager, IDatabaseDriver} from "@mikro-orm/core";
import {Request, Response} from 'express'

export type AppContext = {
    em:  EntityManager<IDatabaseDriver<Connection>>
    req: Request  & {session: Express.SessionStore & {userId: number}}
    res: Response
}
