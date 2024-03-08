import NavBar from "../components/NavBar";
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";
import {usePostsQuery} from "../generated/graphql";
import {Box} from "@chakra-ui/react";

const Index = () => {
    const [{data}] = usePostsQuery()

    return (
        <>
            <NavBar/>
            {!data
                ? <Box>No posts yet...</Box>
                : data.posts.map(post =>
                    <div>{post.title}</div>
                )
            }
        </>
    );
}

export default withUrqlClient(createUrqlClient)(Index);
