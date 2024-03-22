import React, {InputHTMLAttributes} from 'react';
import {useField} from "formik";
import {FormControl, FormErrorMessage, FormLabel, Input, Textarea} from "@chakra-ui/react";

type IInputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string
    name: string
    textarea?: boolean
}

const InputField: React.FC<IInputFieldProps> = ({label, textarea, size: _, ...props}) => {
    const [field, {error}] = useField(props)
    const CustomInput = textarea ? Textarea : Input

    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{label}</FormLabel>
            <CustomInput {...field} {...props} id={field.name}/>
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    );
};

export default InputField;
