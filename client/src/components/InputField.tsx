import React, { InputHTMLAttributes } from 'react'
import {useField} from "formik"
import { type } from 'os';
import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/core';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
	//requiring specific fields
	name: string;
	label: string;
}

export const InputField: React.FC<InputFieldProps> = ({label, size: _, ...props}) => {
		const [field,{error}] = useField(props);
 		return (
			 //cast error string to boolean
			<FormControl isInvalid={!!error}> 
                <FormLabel htmlFor={field.name}>{label}</FormLabel>
                <Input {...field} {...props} id={field.name} />
                {error ? <FormErrorMessage>{error}</FormErrorMessage> : null }
              </FormControl>
		);
}