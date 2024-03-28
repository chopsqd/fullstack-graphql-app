import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
    UseMiddleware
} from "type-graphql";
import {Post} from "../entities/Post";
import {AppContext} from "../types/common-types";
import {isAuth} from "../middleware/isAuth";
import {PostInput} from "../types/PostInput";
import {getConnection} from "typeorm";
import {Updoot} from "../entities/Updoot";

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[]

    @Field(() => Boolean)
    hasMore: boolean
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post
    ): string {
        return root.text.slice(0, 50)
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, {nullable: true}) cursor: string | null
    ): Promise<PaginatedPosts> {
        try {
            const realLimit = Math.min(50, limit)

            const qb = getConnection()
                .getRepository(Post)
                .createQueryBuilder("p")
                .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
                .orderBy('p."createdAt"', "DESC")
                .take(realLimit + 1)

            if (cursor) {
                qb.where('p."createdAt" < :cursor', {
                    cursor: new Date(parseInt(cursor))
                })
            }

            const posts = await qb.getMany()

            return {posts, hasMore: posts.length === realLimit + 1}
        } catch (error) {
            console.log("Error in 'posts' query: ", error.message)
            return error
        }
    }

    @Query(() => Post, {nullable: true})
    async post(
        @Arg('id', () => Int) id: number
    ): Promise<Post | null> {
        try {
            return await Post.findOne({where: {id}, relations: ["creator"]})
        } catch (error) {
            console.log("Error in 'post' query: ", error.message)
            return error
        }
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('input', () => PostInput) input: PostInput,
        @Ctx() {req}: AppContext
    ): Promise<Post> {
        try {
            return await Post.create({...input, creatorId: req.session.userId}).save()
        } catch (error) {
            console.log("Error in 'createPost' mutation: ", error.message)
            return error
        }
    }

    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title', () => String, {nullable: true}) title: string
    ): Promise<Post | null> {
        try {
            const post = await Post.findOne({where: {id}})
            if (!post) {
                return null
            }
            if (typeof title !== 'undefined') {
                await Post.update({id}, {title})
            }
            return post
        } catch (error) {
            console.log("Error in 'updatePost' mutation: ", error.message)
            return error
        }
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id', () => Int) id: number
    ): Promise<boolean> {
        try {
            await Post.delete(id)
            return true
        } catch (error) {
            console.log("Error in 'deletePost' mutation: ", error.message)
            return error
        }
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() {req}: AppContext
    ): Promise<boolean> {
        try {
            const {userId} = req.session

            const updoot = await Updoot.findOne({where: {postId, userId}})

            if (updoot && updoot.value !== value) {
                await getConnection().transaction(async entityManager => {
                    await entityManager.query(`
                        UPDATE updoot
                        SET value = $1
                        WHERE "postId" = $2 AND "userId" = $3
                    `, [value, postId, userId])

                    await entityManager.query(`
                        UPDATE post
                        SET points = points + $1
                        WHERE id = $2
                    `, [2 * value, postId])
                })
            } else if (!updoot) {
                await getConnection().transaction(async entityManager => {
                    // await entityManager.query(`
                    //     INSERT INTO updoot ("userId", "postId", value)
                    //     VALUES (${userId}, ${postId}, ${value})
                    // `)

                    // await entityManager.query(`
                    //     UPDATE post
                    //     SET points = points + ${value}
                    //     WHERE id = ${postId}
                    // `)

                    await entityManager.query(`
                        INSERT INTO updoot ("userId", "postId", value)
                        VALUES ($1, $2, $3)
                    `, [userId, postId, value])

                    await entityManager.query(`
                        UPDATE post
                        SET points = points + $1
                        WHERE id = $2
                    `, [value, postId])
                })
            } else {

            }

            return true
        } catch (error) {
            console.log("Error in 'vote' mutation: ", error.message)
            return error
        }
    }
}
