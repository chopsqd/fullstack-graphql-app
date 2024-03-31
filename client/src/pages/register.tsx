import {Form, Formik} from "formik";
import {Box, Button} from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import {MeDocument, MeQuery, useRegisterMutation} from "../generated/graphql";
import {toErrorMap} from "../utils/toErrorMap";
import {useRouter} from "next/router";
import {withApollo} from "../utils/withApollo";

const Register = () => {
    const router = useRouter()
    const [register] = useRegisterMutation()

    return (
        <Wrapper variant={"small"}>
            <Formik
                initialValues={{email: '', username: '', password: ''}}
                onSubmit={async (values, {setErrors}) => {
                    const response = await register({
                        variables: {options: values},
                        update: (cache, {data}) => {
                            cache.writeQuery<MeQuery>({
                                query: MeDocument,
                                data: {
                                    __typename: "Query",
                                    me: data?.register.user
                                }
                            })
                        },
                    })

                    if (response.data?.register.errors) {
                        setErrors(toErrorMap(response.data.register.errors))
                    } else if (response.data?.register.user) {
                        router.push("/")
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
                                type={"email"}
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

export default withApollo({ssr: false})(Register);
