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
                .orderBy('"createdAt"', "DESC")
                .take(realLimit + 1)

            if (cursor) {
                qb.where('"createdAt" < :cursor', {
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
            return await Post.findOne({where: {id}})
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
}
