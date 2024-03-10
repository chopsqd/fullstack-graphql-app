import argon2 from 'argon2'
import {Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver} from "type-graphql";
import {AppContext} from "../types/common-types";
import {User} from "../entities/User";
import {EntityManager} from '@mikro-orm/postgresql'
import {COOKIE_NAME, FORGET_PASSWORD_PREFIX} from "../constants";
import {UsernamePasswordInput} from "../types/UsernamePasswordInput";
import {validateRegister} from "../utils/validateRegister";
import {sendEmail} from "../utils/sendEmail";
import {v4} from "uuid";

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
    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() {em, redis, req}: AppContext
    ): Promise<UserResponse> {
        try {
            if (newPassword.length <= 5) {
                return {
                    errors: [
                        {
                            field: 'newPassword',
                            message: 'Length must be greater than 5'
                        }
                    ]
                }
            }

            const key = FORGET_PASSWORD_PREFIX + token
            const userId = await redis.get(key)
            if (!userId) {
                return {
                    errors: [
                        {
                            field: 'token',
                            message: 'Expired token'
                        }
                    ]
                }
            }

            const user = await em.findOne(User, {id: parseInt(userId)})
            if (!user) {
                return {
                    errors: [
                        {
                            field: 'token',
                            message: 'User not found'
                        }
                    ]
                }
            }

            user.password = await argon2.hash(newPassword)
            await em.persistAndFlush(user)

            await redis.del(key)

            req.session.userId = user.id

            return {user}
        } catch (error) {
            console.log("Error in 'changePassword' mutation: ", error.message)
            return error
        }
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() {em, redis}: AppContext
    ): Promise<boolean> {
        try {
            const user = await em.findOne(User, {email})
            if (!user) {
                return true
            }

            const token = v4()

            await redis.set(
                FORGET_PASSWORD_PREFIX + token,
                user.id,
                'ex',
                1000 * 60 * 60 * 24
            )

            await sendEmail(
                email,
                `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`
            )

            return true
        } catch (error) {
            console.log("Error in 'forgotPassword' query: ", error.message)
            return error
        }
    }

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
            console.log("Error in 'me' mutation: ", error.message)
            return error
        }
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() {em, req}: AppContext
    ): Promise<UserResponse> {
        try {
            const errors = validateRegister(options)
            if (errors) {
                return {errors}
            }

            const hashedPassword = await argon2.hash(options.password);
            let user;

            const result = await (em as EntityManager)
                .createQueryBuilder(User)
                .getKnexQuery()
                .insert({
                    username: options.username,
                    email: options.email,
                    password: hashedPassword,
                    created_at: new Date(),
                    updated_at: new Date()
                })
                .returning("*")

            user = result[0]

            req.session.userId = user.id

            return {user}
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
        @Arg('usernameOrEmail', () => String) usernameOrEmail: string,
        @Arg('password', () => String) password: string,
        @Ctx() {em, req}: AppContext
    ): Promise<UserResponse> {
        try {
            const user = await em.findOne(
                User,
                usernameOrEmail.includes('@')
                    ? {email: usernameOrEmail}
                    : {username: usernameOrEmail}
            )
            if (!user) {
                return {
                    errors: [
                        {
                            field: 'usernameOrEmail',
                            message: "That username or email doesn't exist"
                        }
                    ]
                }
            }

            const valid = await argon2.verify(user.password!, password)
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

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res}: AppContext
    ): Promise<boolean> {
        return new Promise(resolve => {
            req.session.destroy(error => {
                res.clearCookie(COOKIE_NAME)

                if (error) {
                    console.log("Error in 'logout' mutation: ", error)
                    resolve(false)
                    return
                }

                resolve(true)
            })
        })
    }
}
