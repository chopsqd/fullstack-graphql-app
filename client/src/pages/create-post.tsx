import React from 'react';
import {Form, Formik} from "formik";
import {Box, Button} from "@chakra-ui/react";
import InputField from "../components/InputField";
import {useCreatePostMutation} from "../generated/graphql";
import {useRouter} from "next/router";
import Layout from "../components/Layout";
import {useIsAuth} from "../hooks/useIsAuth";
import {withApollo} from "../utils/withApollo";

const CreatePost = () => {
    const router = useRouter()
    const [createPost] = useCreatePostMutation()

    useIsAuth()

    return (
        <Layout variant={"small"}>
            <Formik
                initialValues={{title: '', text: ''}}
                onSubmit={async (values) => {
                    const {errors} = await createPost({
                        variables: {input: values},
                        update: (cache) => {
                            cache.evict({fieldName: "posts:{}"})
                        }
                    })
                    if (!errors) {
                        router.push("/")
                    }
                }}
            >
                {({isSubmitting}) => (
                    <Form>
                        <Box>
                            <InputField
                                name={"title"}
                                placeholder={"title"}
                                label={"Title"}
                            />
                        </Box>

                        <Box mt={4}>
                            <InputField
                                textarea
                                name={"text"}
                                placeholder={"text..."}
                                label={"Text"}
                            />
                        </Box>

                        <Button
                            mt={4}
                            type={"submit"}
                            isLoading={isSubmitting}
                            colorScheme={"teal"}
                        >
                            Create Post
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
};

export default withApollo({ssr: false})(CreatePost);
