import React from 'react';
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../../utils/createUrqlClient";
import Layout from "../../components/Layout";
import {Box, Heading, Spinner} from "@chakra-ui/react";
import {useGetPostFromUrl} from "../../utils/useGetPostFromUrl";
import PostButtons from "../../components/PostButtons";

const Post = () => {
    const [{data, error, fetching}] = useGetPostFromUrl()

    if (fetching) {
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
        <Layout>
            <Heading mb={4}>{data.post.title}</Heading>
            <Box mb={4}>{data.post.text}</Box>
            <PostButtons
                id={data.post.id}
                creatorId={data.post.creator.id}
            />
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);
