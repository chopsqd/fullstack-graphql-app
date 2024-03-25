import argon2 from 'argon2'
import {Arg, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root} from "type-graphql";
import {AppContext} from "../types/common-types";
import {User} from "../entities/User";
import {COOKIE_NAME, FORGET_PASSWORD_PREFIX} from "../constants";
import {UsernamePasswordInput} from "../types/UsernamePasswordInput";
import {validateRegister} from "../utils/validateRegister";
import {sendEmail} from "../utils/sendEmail";
import {v4} from "uuid";
import {getConnection} from "typeorm";

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

@Resolver(User)
export class UserResolver {
    @FieldResolver(() => String)
    email(
        @Root() user: User,
        @Ctx() {req}: AppContext
    ): string {
        if (req.session.userId === user.id) {
            return user.email
        }

        return ""
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() {redis, req}: AppContext
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

            const userIdNum = parseInt(userId)
            const user = await User.findOne({where: {id: userIdNum}})
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

            const hashedPassword = await argon2.hash(newPassword)
            await User.update({id: userIdNum}, {password: hashedPassword})

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
        @Ctx() {redis}: AppContext
    ): Promise<boolean> {
        try {
            const user = await User.findOne({where: {email}})
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
        @Ctx() {req}: AppContext
    ): Promise<User | null> {
        try {
            if (!req.session.userId) {
                return null
            }

            const user = await User.findOne({where: {id: req.session.userId}})
            return user
        } catch (error) {
            console.log("Error in 'me' mutation: ", error.message)
            return error
        }
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() {req}: AppContext
    ): Promise<UserResponse> {
        try {
            const errors = validateRegister(options)
            if (errors) {
                return {errors}
            }

            const hashedPassword = await argon2.hash(options.password);
            let user;

            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    username: options.username,
                    email: options.email,
                    password: hashedPassword,
                })
                .returning('*')
                .execute()

            user = result.raw[0]

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
        @Ctx() {req}: AppContext
    ): Promise<UserResponse> {
        try {
            const user = await User.findOne({
                where: usernameOrEmail.includes('@')
                    ? {email: usernameOrEmail}
                    : {username: usernameOrEmail}
            })
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
