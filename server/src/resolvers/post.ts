import {Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver, UseMiddleware} from "type-graphql";
import {Post} from "../entities/Post";
import {AppContext} from "../types/common-types";
import {isAuth} from "../middleware/isAuth";

@InputType()
class PostInput {
    @Field()
    title: string

    @Field()
    text: string
}

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(): Promise<Post[]> {
        try {
            return await Post.find()
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
        @Arg('input', () => String) input: PostInput,
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
