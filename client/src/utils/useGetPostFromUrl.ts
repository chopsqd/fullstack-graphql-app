import {usePostQuery} from "../generated/graphql";
import {useGetPostId} from "./useGetPostId";

export const useGetPostFromUrl = () => {
    const postId = useGetPostId()
    return usePostQuery({
        pause: postId === -1,
        variables: {
            id: postId
        }
    })
}
