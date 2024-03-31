import {usePostsQuery} from "../generated/graphql";
import {Box, Button, Flex, Heading, Link, Stack, Text} from "@chakra-ui/react";
import Layout from "../components/Layout";
import NextLink from "next/link";
import UpdootSection from "../components/UpdootSection";
import PostButtons from "../components/PostButtons";
import {withApollo} from "../utils/withApollo";

const Index = () => {
    const {data, error, loading, fetchMore, variables} = usePostsQuery({
        variables: {
            limit: 10,
            cursor: null as null | string
        },
        notifyOnNetworkStatusChange: true
    })

    if (!loading && !data) {
        return <Box>
            <div>You got query failed for some reason</div>
            <div>{error?.message}</div>
        </Box>
    }

    return (
        <Layout>
            <Flex align={"center"}>
                <Heading>LiReddit</Heading>
                <NextLink href={"/create-post"}>
                    <Link ml={"auto"}>Create post</Link>
                </NextLink>
            </Flex>

            {!data && loading
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
                        isLoading={loading}
                        onClick={() => {
                            fetchMore({
                                variables: {
                                    limit: variables?.limit,
                                    cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
                                },
                                // updateQuery: (previousValue, {fetchMoreResult}): PostsQuery => {
                                //     if (!fetchMoreResult) {
                                //         return previousValue as PostsQuery
                                //     }
                                //
                                //     return {
                                //         __typename: "Query",
                                //         posts: {
                                //             __typename: "PaginatedPosts",
                                //             hasMore: (fetchMoreResult as PostsQuery).posts.hasMore,
                                //             posts: [
                                //                 ...(previousValue as PostsQuery).posts.posts,
                                //                 ...(fetchMoreResult as PostsQuery).posts.posts
                                //             ]
                                //         }
                                //     };
                                // }
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

export default withApollo({ssr: true})(Index);
