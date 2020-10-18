import { UsernamePasswordInput } from './UsernamePasswordInput';

export const validateRegister = (options: UsernamePasswordInput) => {

	if(!options.email.includes("@")) {
		return [
			{
				field: "email",
				message: "Invalid Email"
			}
		]
	}

	if(options.username.length <= 2) {
		console.log("EMAIL", options)
		return [
			{
				field: "username",
				message: "username must be at least 3 characters"
			}]
	}

	if(options.username.includes("@")) {
		return [
			{
				field: "username",
				message: "Username cannot include an @ symbol"
			}
		]
	}


	if(options.password.length < 8) {
		return [
			{
				field: "password",
				message: "password must be at least 8 characters"
			}
		]
	}

	return null;
}