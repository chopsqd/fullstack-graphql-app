import React from 'react';
import NextLink from "next/link";
import {Box, IconButton, Link} from "@chakra-ui/react";
import {DeleteIcon, EditIcon} from "@chakra-ui/icons";
import {useDeletePostMutation, useMeQuery} from "../generated/graphql";

interface IPostButtonsProps {
    id: number
    creatorId: number
}

const PostButtons: React.FC<IPostButtonsProps> = ({id, creatorId}) => {
    const {data: meData} = useMeQuery()
    const [deletePost] = useDeletePostMutation()

    if (meData?.me.id !== creatorId) {
        return null
    }

    return (
        <Box>
            <NextLink href={"/post/edit/[id]"} as={`/post/edit/${id}`}>
                <IconButton
                    as={Link}
                    mr={3}
                    icon={<EditIcon/>}
                    aria-label={"Edit post"}
                />
            </NextLink>
            <IconButton
                icon={<DeleteIcon/>}
                aria-label={"Delete post"}
                onClick={() => {
                    deletePost({
                        variables: {id},
                        update: (cache) => {
                            cache.evict({id: "Post:" + id});
                        },
                    });
                }}
            />
        </Box>
    );
};

export default PostButtons;
