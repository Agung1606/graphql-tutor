import { MyContext } from '../types';
import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType} from 'type-graphql'
import { User } from '../entities/User';
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string

    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse> {
        if(!options.username) {
            return {
                errors: [{
                    field: 'username',
                    message: 'Username required'
                }]
            }
        }

        if(!options.password) {
            return {
                errors: [{
                    field: 'password',
                    message: 'Password required'
                }]
            }
        }

        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, { 
            username: options.username,
            password: hashedPassword
        });
        
        try {
            await em.persistAndFlush(user);
        } catch (error) {
            if(error.code === '23505') {
                return {
                    errors: [{
                        field: 'username',
                        message: 'Username already taken'
                    }]
                }
            }
        }
        
        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse> {

        if(!options.username || !options.password) {
            return {
                errors: [{
                    field: 'credentials',
                    message: 'Please provide credentials'
                }]
            };
        }

        const user = await em.findOne(User, { username: options.username });
        if(!user) {
            return {
                errors: [{
                    field: 'user',
                    message: 'user not found'
                }]
            };
        }
        
        const valid = await argon2.verify(user.password, options.password);
        if(!valid) {
            return {
                errors: [{
                    field: 'password',
                    message: 'incorret password'
                }]
            };
        }

        return { user };
    }  
}