import { sendEmail } from '../utils/sendEmail';
import { validateRegister } from './../utils/validateRegister';
import { User } from './../entities/User';
import { MyContext } from './../types';
import { Resolver, Mutation, Arg, Field, Ctx, ObjectType, Query } from "type-graphql";
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql'
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX} from '../constants';
import { UsernamePasswordInput } from '../utils/UsernamePasswordInput';
import { v4 } from 'uuid';

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

	@Mutation(() => UserResponse)
	async changePassword(
		@Arg("token") token: string,
		@Arg("newPassword") newPassword: string,
		@Ctx() {redis, em, req}: MyContext
	): Promise<UserResponse>{

		if(newPassword.length < 8) {
			return { errors: [
				{
					field: "newPassword",
					message: "Password must be at least 8 characters"
				}
			]};
		}

		const key = FORGOT_PASSWORD_PREFIX+token
		const userId = await redis.get(key);
		if(!userId){
			return {
				errors: [
					{
					field: "token",
					message: "Token expired"
				}
				]
			}
		}

		const user = await em.findOne(User, {id: parseInt(userId)});
		if (!user) {
			return {
				errors: [
					{
					field: "token",
					message: "User no longer exists"
				}
				]
			}
		}

		user.password = await argon2.hash(newPassword);
		await em.persistAndFlush(user);
		await redis.del(key);

		//login user after changing password
		req.session.userId = user.id

		return {user};
	}

	@Mutation(() => Boolean)
	async forgotPassword(
		@Arg("email") email: string,
		@Ctx() {em, redis}: MyContext
	) {
		const user = await em.findOne(User, {email})
		if(!user){
			//email not in database
			return true;
		}

		const token = v4();
		//1 day to change your password
		await redis.set(
			FORGOT_PASSWORD_PREFIX + token,
			user.id,
			"ex", 
			1000 * 60 * 60 * 24
		);
		
		await sendEmail(
			email, 
			`<a href='http://localhost:3000/change-password/${token}'>reset your password</a>`
			);
		return true;
	}
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
		const errors  = validateRegister(options);
		if (errors) {
			return {errors};
		}

		const hashedPassword = await argon2.hash(options.password)
		let user;

		try {
			const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
				username: options.username,
				password: hashedPassword,
				email: options.email,
				created_at: new Date(),
				updated_at: new Date(),
			}).returning("*");
			user = result[0];
		} catch (error) {
			// || error.detail.includes("already exists")
			if (error.code === "23505" ){
				//dupe username error
				return {
					errors: [{
						field: "username",
						message: "Username already exists"
					}]
				}
			}
		}
		//sets cookie/log in user after register
		req.session.userId = user.id
		return {user};
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("usernameOrEmail") usernameOrEmail: string,
		@Arg("password") password: string,
		@Ctx() {em, req}: MyContext
	): Promise<UserResponse> {
		const user = await em.findOne(User, usernameOrEmail.includes("@") ? {email: usernameOrEmail}: {username: usernameOrEmail})
		if (!user)
			return {
				errors: [{
					field: "usernameOrEmail",
					message: "Username does not exist",
				}]
			}
		const valid = await argon2.verify(user.password, password)
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

	@Mutation(() => Boolean)
	logout(
		@Ctx() {req, res}: MyContext
	){
		return new Promise(resolve =>	req.session.destroy(err => {
			if (err){
				console.log(err);
				resolve(false);
				return
			} 
			res.clearCookie(COOKIE_NAME);
			resolve(true)
		}));
	}
}