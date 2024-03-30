import DataLoader from "dataloader";
import {User} from "../entities/User";

export const newUserLoader = () =>
    new DataLoader<number, User>(async userIds => {
        const users: User[] = await User.findByIds(userIds as number[])
        const userIdToUser: Record<number, User> = {}

        users.forEach((user: User) => {
            userIdToUser[user.id] = user
        })

        return userIds.map(userId => userIdToUser[userId])
    })
