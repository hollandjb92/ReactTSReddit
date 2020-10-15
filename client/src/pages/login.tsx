import React from 'react'
import {Formik, Form} from 'formik'
import { Box, Button} from '@chakra-ui/core';
import  {Wrapper} from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';

const Login: React.FC<{}> = ({}) => {
		const router = useRouter();
		const [{},login] = useLoginMutation();
		return (
			<Wrapper variant="small">
				<Formik initialValues={{username: "", password: ""}} onSubmit={async (values, {setErrors}) => {
					const response = await login({options: values})
					if(response.data?.login.errors) {
						setErrors(toErrorMap(response.data.login.errors))
					} else if (response.data?.login.user){
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
						<Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">login</Button>
					</Form>
				)}
				</Formik>
			</Wrapper>
		);
}

export default withUrqlClient(createUrqlClient)(Login);