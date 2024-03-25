import {Field, Int, ObjectType} from "type-graphql";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    ManyToOne
} from "typeorm";
import {User} from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number

    @Field(() => String)
    @Column()
    title!: string

    @Field(() => String)
    @Column()
    text!: string

    @Field(() => Int)
    @Column({type: 'int', default: 0})
    points!: number

    @Field(() => String)
    @CreateDateColumn()
    createdAt?: Date

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt?: Date

    @Field(() => Int)
    @Column()
    creatorId: number

    @Field(() => User)
    @ManyToOne(() => User, user => user.posts)
    creator: User
}
