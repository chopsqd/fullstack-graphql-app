import {Request, Response} from 'express'
import {Redis} from 'ioredis'
import {newUserLoader} from "../utils/newUserLoader";
import {newUpdootLoader} from "../utils/newUpdootLoader";

export type AppContext = {
    req: Request & { session: Express.SessionStore & { userId: number } }
    redis: Redis
    res: Response
    userLoader: ReturnType<typeof newUserLoader>
    updootLoader: ReturnType<typeof newUpdootLoader>
}
