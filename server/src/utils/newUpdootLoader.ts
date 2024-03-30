import DataLoader from "dataloader";
import {Updoot} from "../entities/Updoot";

export const newUpdootLoader = () =>
    new DataLoader<{postId: number, userId: number}, Updoot | null>(async keys => {
        const updoots: Updoot[] = await Updoot.findByIds(keys as any)
        const updootIdsToUpdoot: Record<string, Updoot> = {}

        updoots.forEach((updoot: Updoot) => {
            updootIdsToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot
        })

        return keys.map(key => updootIdsToUpdoot[`${key.userId}|${key.postId}`])
    })
