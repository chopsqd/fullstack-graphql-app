import NavBar from "../components/NavBar";
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";
import {usePostsQuery} from "../generated/graphql";
import {Box, Heading, Text, Link, Stack, Flex, Button} from "@chakra-ui/react";
import Layout from "../components/Layout";
import NextLink from "next/link";
import {useState} from "react";

const Index = () => {
    const [variables, setVariables] = useState({
        limit: 10,
        cursor: null as null | string
    })
    const [{data, fetching}] = usePostsQuery({variables})

    if (!fetching && !data) {
        return <Box>You got query failed for some reason</Box>
    }

    return (
        <Layout>
            <Flex align={"center"}>
                <Heading>LiReddit</Heading>
                <NextLink href={"/create-post"}>
                    <Link ml={"auto"}>Create post</Link>
                </NextLink>
            </Flex>

            {!data && fetching
                ? <Box>Loading...</Box>
                : <Stack spacing={8}>
                    {data!.posts.posts.map(post =>
                        <Box key={post.id} p={5} shadow={"md"} borderWidth={"1px"}>
                            <Heading fontSize={"xl"}>{post.title}</Heading>
                            <Text>posted by <b>{post.creator.username}</b></Text>
                            <Text mt={4}>{post.textSnippet}</Text>
                        </Box>
                    )}
                </Stack>
            }

            {data && data.posts.hasMore
                ? <Flex>
                    <Button
                        m={"auto"}
                        my={8}
                        isLoading={fetching}
                        onClick={() => {
                            setVariables({
                                limit: variables.limit,
                                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
                            })
                        }}
                    >
                        Load more
                    </Button>
                </Flex>
                : null
            }
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(Index);
