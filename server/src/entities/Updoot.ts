import {Field, Int, ObjectType} from "type-graphql";
import {BaseEntity, Column, Entity, ManyToOne, PrimaryColumn} from "typeorm";
import {User} from "./User";
import {Post} from "./Post";

// Many to Many
// Users <-> Posts
// Users -> JOIN TABLE <- Posts
// Users -> Updoot <- Posts

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
    @Field(() => Int)
    @Column({type: "int"})
    value: number

    @Field(() => Int)
    @PrimaryColumn()
    userId: number

    @Field(() => User)
    @ManyToOne(() => User, user => user.updoots)
    user: User

    @Field(() => Int)
    @PrimaryColumn()
    postId: number

    @Field(() => Post)
    @ManyToOne(() => Post, post => post.updoots, {
        onDelete: 'CASCADE'
    })
    post: Post
}
