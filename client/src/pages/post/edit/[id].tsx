import React from 'react';
import {Form, Formik} from "formik";
import {Box, Button, Spinner} from "@chakra-ui/react";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import {usePostQuery, useUpdatePostMutation} from "../../../generated/graphql";
import {useGetPostId} from "../../../utils/useGetPostId";
import {useRouter} from "next/router";
import {withApollo} from "../../../utils/withApollo";

const EditPost = () => {
    const router = useRouter()
    const postId = useGetPostId()
    const {data, error, loading} = usePostQuery({
        skip: postId === -1,
        variables: {
            id: postId
        }
    })
    const [updatePost] = useUpdatePostMutation()

    if (loading) {
        return <Box>
            <Spinner/>
        </Box>
    }

    if (error) {
        return <Layout>{error.message}</Layout>
    }

    if (!data?.post) {
        return <Layout>
            <Box>Post not found</Box>
        </Layout>
    }

    return (
        <Layout variant={"small"}>
            <Formik
                initialValues={{title: data.post.title, text: data.post.text}}
                onSubmit={async (values) => {
                    await updatePost({variables: {id: postId, ...values}})
                    router.back()
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
                            Update Post
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
};

export default withApollo({ssr: false})(EditPost);
