import {Entity, PrimaryKey, Property} from "@mikro-orm/core";
import {Field, Int, ObjectType} from "type-graphql";

@ObjectType()
@Entity()
export class Post {
    @Field(() => Int)
    @PrimaryKey()
    id!: number

    @Field(() => String)
    @Property({type: 'date'})
    createdAt? = new Date()

    @Field(() => String)
    // onUpdate: () => new Date()
    // присваивает значение new Date() каждый раз когда происходит onUpdate
    @Property({type: 'date', onUpdate: () => new Date()})
    updatedAt? = new Date()

    @Field()
    @Property({type: 'text'})
    title!: string
}
