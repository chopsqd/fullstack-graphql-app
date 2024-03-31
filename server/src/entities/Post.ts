import {Field, Int, ObjectType} from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {User} from "./User";
import {Updoot} from "./Updoot";

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

    @Field(() => Int, {nullable: true})
    voteStatus: number | null

    @Field(() => User)
    @ManyToOne(() => User, user => user.posts)
    creator: User

    @OneToMany(() => Updoot, updoot => updoot.post)
    updoots: Updoot[]
}
