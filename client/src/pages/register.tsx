import React from 'react'
import {Formik, Form} from 'formik'
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/core';
import  {Wrapper} from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';

interface registerProps {

}


const Register: React.FC<registerProps> = ({}) => {
		const [{},register] = useRegisterMutation();
		return (
			<Wrapper variant="small">
				<Formik initialValues={{username: "", password: ""}} onSubmit={async (values) => {
					const response = await register(values)
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