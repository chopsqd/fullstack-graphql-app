import {MiddlewareFn} from "type-graphql";
import {AppContext} from "../types/common-types";

export const isAuth: MiddlewareFn<AppContext> = ({context}, next) => {
    if (!context.req.session.userId) {
        throw new Error('Not authenticated')
    }

    return next()
}
