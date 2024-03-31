import React from 'react';
import Layout from "../../components/Layout";
import {Box, Heading, Spinner} from "@chakra-ui/react";
import {useGetPostFromUrl} from "../../utils/useGetPostFromUrl";
import PostButtons from "../../components/PostButtons";
import {withApollo} from "../../utils/withApollo";

const Post = () => {
    const {data, error, loading} = useGetPostFromUrl()

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

export default withApollo({ssr: true})(Post);
