import {Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver} from "type-graphql";
import {AppContext} from "../types";
import {User} from "../entities/User";
import argon2 from 'argon2'

@InputType()
class UsernamePasswordInput {
    @Field(() => String)
    username: string

    @Field(() => String)
    password: string
}

@ObjectType()
class FieldError {
    @Field(() => String)
    field: string

    @Field(() => String)
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(() => User, {nullable: true})
    user?: User
}

@Resolver()
export class UserResolver {
    @Query(() => User, {nullable: true})
    async me(
        @Ctx() {req, em}: AppContext
    ): Promise<User | null> {
        try {
            if (!req.session.userId) {
                return null
            }

            const user = await em.findOne(User, {id: req.session.userId})
            return user
        } catch (error) {
            console.log("Error in 'me' query: ", error.message)
            return error
        }
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() {em, req}: AppContext
    ) : Promise<UserResponse> {
        try {
            if (options.username.length <= 2) {
                return {
                    errors: [
                        {
                           field: 'username',
                           message: 'Length must be greater than 2'
                        }
                    ]
                }
            }

            if (options.password.length <= 5) {
                return {
                    errors: [
                        {
                            field: 'password',
                            message: 'Length must be greater than 5'
                        }
                    ]
                }
            }

            const hashedPassword = await argon2.hash(options.password)
            const user = em.create(User, {
                username: options.username,
                password: hashedPassword
            })
            await em.persistAndFlush(user)

            req.session.userId = user.id

            return { user }
        } catch (error) {
            if (error.code === '23505') {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'Username already taken'
                        }
                    ]
                }
            }

            console.log("Error in 'register' mutation: ", error.message)
            return error
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() {em, req}: AppContext
    ) : Promise<UserResponse> {
        try {
            const user = await em.findOne(User, {username: options.username})
            if (!user) {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: "That username doesn't exist"
                        }
                    ]
                }
            }

            const valid = await argon2.verify(user.password!, options.password)
            if (!valid) {
                return {
                    errors: [
                        {
                            field: 'password',
                            message: "Invalid login"
                        }
                    ]
                }
            }

            req.session.userId = user.id

            return {
                user
            }
        } catch (error) {
            console.log("Error in 'login' mutation: ", error.message)
            return error
        }
    }
}
