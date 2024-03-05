import {Arg, Ctx, Int, Mutation, Query, Resolver} from "type-graphql";
import {Post} from "../entities/Post";
import {AppContext} from "../types";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(
        @Ctx() {em}: AppContext
    ): Promise<Post[]> {
        try {
            return await em.find(Post, {})
        } catch (error) {
            console.log("Error in 'posts' query: ", error.message)
            return error
        }
    }

    @Query(() => Post, {nullable: true})
    async post(
        @Arg('id', () => Int) id: number,
        @Ctx() {em}: AppContext
    ): Promise<Post | null> {
        try {
            return await em.findOne(Post, {id})
        } catch (error) {
            console.log("Error in 'post' query: ", error.message)
            return error
        }
    }

    @Mutation(() => Post)
    async createPost(
        @Arg('title', () => String) title: string,
        @Ctx() {em}: AppContext
    ): Promise<Post> {
        try {
            const post = em.create(Post, {title})
            await em.persistAndFlush(post)
            return post
        } catch (error) {
            console.log("Error in 'createPost' mutation: ", error.message)
            return error
        }
    }

    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title', () => String, {nullable: true}) title: string,
        @Ctx() {em}: AppContext
    ): Promise<Post | null> {
        try {
            const post = await em.findOne(Post, {id})
            if (!post) {
                return null
            }
            if (typeof title !== 'undefined') {
                post.title = title
                await em.persistAndFlush(post)
            }
            return post
        } catch (error) {
            console.log("Error in 'updatePost' mutation: ", error.message)
            return error
        }
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() {em}: AppContext
    ): Promise<boolean> {
        try {
            await em.nativeDelete(Post, {id})
            return true
        } catch (error) {
            console.log("Error in 'deletePost' mutation: ", error.message)
            return error
        }
    }
}
