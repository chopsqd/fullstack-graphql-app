import React from 'react';
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../../utils/createUrqlClient";
import {useRouter} from "next/router";
import {usePostQuery} from "../../generated/graphql";
import Layout from "../../components/Layout";
import {Box, Heading, Spinner} from "@chakra-ui/react";

const Post = () => {
    const router = useRouter()
    const postId = typeof router.query.id === "string" ? parseInt(router.query.id) : -1
    const [{data, error, fetching}] = usePostQuery({
        pause: postId === -1,
        variables: {
            id: postId
        }
    })

    if (fetching) {
        return <Box>
            <Spinner />
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
        <Layout>
            <Heading mb={4}>{data.post.title}</Heading>
            {data.post.text}
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);
