import React, {useState} from 'react';
import {Form, Formik} from "formik";
import {toErrorMap} from "../../utils/toErrorMap";
import {Button, Flex, Link, Text} from "@chakra-ui/react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import {MeDocument, MeQuery, useChangePasswordMutation} from "../../generated/graphql";
import {useRouter} from "next/router";
import NextLink from "next/link";
import {withApollo} from "../../utils/withApollo";

const ChangePassword = () => {
    const router = useRouter()
    const [tokenError, setTokenError] = useState('')
    const [changePassword] = useChangePasswordMutation()

    return (
        <Wrapper variant={"small"}>
            <Formik
                initialValues={{newPassword: ''}}
                onSubmit={async (values, {setErrors}) => {
                    const response = await changePassword({
                        variables: {
                            newPassword: values.newPassword,
                            token: typeof router.query.token === "string"
                                ? router.query.token
                                : ""
                        },
                        update: (cache, {data}) => {
                            cache.writeQuery<MeQuery>({
                                query: MeDocument,
                                data: {
                                    __typename: "Query",
                                    me: data?.changePassword.user
                                }
                            })
                        }
                    })

                    if (response.data?.changePassword.errors) {
                        const errorMap = toErrorMap(response.data.changePassword.errors)
                        if ("token" in errorMap) {
                            setTokenError(errorMap.token)
                        }
                        setErrors(errorMap)
                    } else if (response.data?.changePassword.user) {
                        router.push("/")
                    }
                }}
            >
                {({isSubmitting}) => (
                    <Form>
                        <InputField
                            name={"newPassword"}
                            placeholder={"new password"}
                            label={"New password"}
                            type={"password"}
                        />

                        {tokenError
                            ? <Flex gap={2}>
                                <Text color='tomato'>{tokenError}</Text>
                                <NextLink href={"/forgot-password"}>
                                    <Link>Get a new one</Link>
                                </NextLink>
                            </Flex>
                            : null
                        }

                        <Button
                            mt={4}
                            type={"submit"}
                            isLoading={isSubmitting}
                            colorScheme={"teal"}
                        >
                            Change password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withApollo({ssr: false})(ChangePassword)
