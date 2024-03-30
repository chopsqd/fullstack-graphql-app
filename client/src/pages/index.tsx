import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";
import {usePostsQuery} from "../generated/graphql";
import {Box, Button, Flex, Heading, Link, Stack, Text} from "@chakra-ui/react";
import Layout from "../components/Layout";
import NextLink from "next/link";
import {useState} from "react";
import UpdootSection from "../components/UpdootSection";
import PostButtons from "../components/PostButtons";

const Index = () => {
    const [{data, fetching}] = usePostsQuery({variables})
    const [variables, setVariables] = useState({
        limit: 10,
        cursor: null as null | string
    })

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
                        !post ? null : (
                            <Flex key={post.id} p={5} shadow={"md"} borderWidth={"1px"}>
                                <UpdootSection post={post}/>
                                <Box flex={1}>
                                    <NextLink href={"/post/[id]"} as={`/post/${post.id}`}>
                                        <Link>
                                            <Heading fontSize={"xl"}>{post.title}</Heading>
                                        </Link>
                                    </NextLink>
                                    <Text>posted by <b>{post.creator.username}</b></Text>
                                    <Flex align={"center"} justifyContent={"space-between"}>
                                        <Text flex={1} mt={4}>{post.textSnippet}</Text>
                                        <Box ml={"auto"}>
                                            <PostButtons
                                                id={post.id}
                                                creatorId={post.creator.id}
                                            />
                                        </Box>
                                    </Flex>
                                </Box>
                            </Flex>
                        )
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
