import { User } from './../entities/User';
import { MyContext } from './../types';
import { Resolver, Mutation, Arg, InputType, Field, Ctx, ObjectType, Query } from "type-graphql";
import argon2 from 'argon2'

@InputType()
class UsernamePasswordInput{
	@Field()
	username: string
	@Field()
	password: string
}

@ObjectType()
class FieldError{
	@Field()
	field: string

	@Field()
	message: string
}

@ObjectType()
class UserResponse{
	@Field(() => [FieldError], {nullable: true})
	errors?: FieldError[]

	@Field(() => User, {nullable: true})
	user?: User
}



@Resolver()
export class UserResolver {
	@Query(() => User, {nullable: true})
	async me(
		@Ctx() {req, em}: MyContext
	){
		if(!req.session.userId) { //user not logged in
			return null
		}

		const user = await em.findOne(User, {id: req.session.userId})
		return user;
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() {em, req}: MyContext
	): Promise<UserResponse>{
		if(options.username.length <= 2) {
			return {
				errors: [{
					field: "username",
					message: "username must be at least 3 characters"
				}]
			}
		}

		if(options.password.length <= 8) {
			return {
				errors: [{
					field: "password",
					message: "password must be at least 8 characters"
				}]
			}
		}

		const hashedPassword = await argon2.hash(options.password)
		const user = em.create(User, {username: options.username, password: hashedPassword})

		try {
			await em.persistAndFlush(user);
		} catch (error) {
			if (error.code === "23505" || error.detail.includes("already exists")){
				//dupe username error
				return {
					errors: [{
						field: "username",
						message: "username already exists"
					}]
				}
			}
		}
		//sets cookie/log in user after register
		req.session.userId = user.id
		return {user}
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() {em, req}: MyContext
	): Promise<UserResponse> {
		const user = await em.findOne(User, {username: options.username})
		if (!user)
			return {
				errors: [{
					field: "username",
					message: "Username does not exist",
				}]
			}
		const valid = await argon2.verify(user.password, options.password)
		if (!valid)
			return {
				errors:[{
					field: "password",
					message: "Password is not correct"
				}]
			}

		req.session.userId = user.id
		return {user};
	}
}