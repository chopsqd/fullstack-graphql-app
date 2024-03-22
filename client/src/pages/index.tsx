import NavBar from "../components/NavBar";
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";
import {usePostsQuery} from "../generated/graphql";
import {Box, Link} from "@chakra-ui/react";
import Layout from "../components/Layout";
import NextLink from "next/link";

const Index = () => {
    const [{data}] = usePostsQuery()

    return (
        <Layout>
            <NextLink href={"/create-post"}>
                <Link>Create post</Link>
            </NextLink>

            {!data
                ? <Box>No posts yet...</Box>
                : data.posts.map(post =>
                    <div>{post.title}</div>
                )
            }
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(Index);
