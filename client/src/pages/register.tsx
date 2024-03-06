import {Form, Formik} from "formik";
import {Box, Button} from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import {useRegisterMutation} from "../generated/graphql";

const Register = () => {
    const [{}, register] = useRegisterMutation()

    return (
        <Wrapper variant={"small"}>
            <Formik
                initialValues={{username: '', password: ''}}
                onSubmit={async (values) => {
                    const response = await register(values)
                }}
            >
                {({isSubmitting}) => (
                    <Form>
                        <InputField
                            name={"username"}
                            placeholder={"username"}
                            label={"Username"}
                        />
                        <Box mt={4}>
                            <InputField
                                name={"password"}
                                placeholder={"password"}
                                label={"Password"}
                                type={"password"}
                            />
                        </Box>

                        <Button
                            mt={4}
                            type={"submit"}
                            isLoading={isSubmitting}
                            colorScheme={"teal"}
                        >
                            Register
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default Register;
