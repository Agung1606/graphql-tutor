import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ObjectType, Field, Int } from 'type-graphql'

// @Entity() = make the class as table in the database
// @Property = make it as column in the database
// @Property({ onUpdate: () => new Date() }) = special hooks for create a new date
// @PrimaryKey() = it is primary key in the database

@ObjectType()
@Entity()
export class User {
    @Field(() => Int)
    @PrimaryKey()
    id!: number;

    @Field(() => String)
    @Property({ type: 'date' })
    createdAt = new Date();

    @Field(() => String)
    @Property({ type: 'date', onUpdate: () => new Date() })
    updateAt = new Date();

    @Field(() => String)
    @Property({ type: 'text', unique: true })
    username!: string;

    @Property({ type: 'text' })
    password!: string;
}