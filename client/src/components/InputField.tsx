import React, {InputHTMLAttributes} from 'react';
import {useField} from "formik";
import {FormControl, FormErrorMessage, FormLabel, Input} from "@chakra-ui/react";

type IInputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string
    name: string
}

const InputField: React.FC<IInputFieldProps> = ({label, size: _, ...props}) => {
    const [field, {error}] = useField(props)

    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{label}</FormLabel>
            <Input {...field} {...props} id={field.name}/>
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    );
};

export default InputField;
