import {Form, Formik} from "formik";
import {Box, Button} from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import {useRegisterMutation} from "../generated/graphql";
import {toErrorMap} from "../utils/toErrorMap";
import {useRouter} from "next/router";
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";

const Register = () => {
    const router = useRouter()
    const [{}, register] = useRegisterMutation()

    return (
        <Wrapper variant={"small"}>
            <Formik
                initialValues={{email: '', username: '', password: ''}}
                onSubmit={async (values, {setErrors}) => {
                    const response = await register({options: values})
                    if (response.data?.register.errors) {
                        setErrors(toErrorMap(response.data.register.errors))
                    } else if (response.data?.register.user) {
                        router.push('/')
                    }
                }}
            >
                {({isSubmitting}) => (
                    <Form>
                        <Box>
                            <InputField
                                name={"username"}
                                placeholder={"username"}
                                label={"Username"}
                            />
                        </Box>
                        <Box mt={4}>
                            <InputField
                                name={"password"}
                                placeholder={"password"}
                                label={"Password"}
                                type={"password"}
                            />
                        </Box>
                        <Box mt={4}>
                            <InputField
                                name={"email"}
                                placeholder={"email"}
                                label={"Email"}
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

export default withUrqlClient(createUrqlClient)(Register);
