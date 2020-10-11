import React from 'react'
import {Formik, Form} from 'formik'
import { Box, Button} from '@chakra-ui/core';
import  {Wrapper} from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
interface registerProps {

}


const Register: React.FC<registerProps> = ({}) => {
		const router = useRouter();
		const [{},register] = useRegisterMutation();
		return (
			<Wrapper variant="small">
				<Formik initialValues={{username: "", password: ""}} onSubmit={async (values, {setErrors}) => {
					const response = await register(values)
					if(response.data?.register.errors) {
						setErrors(toErrorMap(response.data.register.errors))
					} else if (response.data?.register.user){
						//got user back
						router.push("/")
					}
				}}>
				{({isSubmitting}) => (
					<Form>
						<Box mt={4}>
						<InputField name="username" placeholder="username" label="Username" />
						<InputField name="password" placeholder="password" label="Password" type="password"/>
						</Box>
						<Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">register</Button>
					</Form>
				)}
				</Formik>
			</Wrapper>
		);
}

export default Register;