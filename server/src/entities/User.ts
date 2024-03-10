import {Field, Int, ObjectType} from "type-graphql";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    OneToMany
} from "typeorm";
import {Post} from "./Post";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number

    @Field(() => String)
    @CreateDateColumn()
    createdAt?: Date

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt?: Date

    @Field(() => String)
    @Column({unique: true})
    username!: string

    @Field(() => String)
    @Column({unique: true})
    email!: string

    @Field(() => String)
    @Column()
    password?: string

    @OneToMany(() => Post, post => post.creator)
    posts: Post[]
}
