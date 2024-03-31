import React, {useState} from 'react';
import {Flex, IconButton} from "@chakra-ui/react";
import {ChevronDownIcon, ChevronUpIcon} from "@chakra-ui/icons";
import {PostSnippetFragment, useVoteMutation, VoteMutation} from "../generated/graphql";
import gql from "graphql-tag";
import {ApolloCache} from "@apollo/client";

interface IFragmentData {
    id: number
    points: number
    voteStatus: number | null
}

const updateAfterVote = (value: number, postId: number, cache: ApolloCache<VoteMutation>) => {
    const data = cache.readFragment<IFragmentData>({
        id: "Post:" + postId,
        fragment: gql`
            fragment _ on Post {
                id
                points
                voteStatus
            }
        `
    });

    if (data) {
        if (data.voteStatus === value) {
            return
        }

        const newPoints = (data.points as number) + (!data.voteStatus ? 1 : 2) * value
        cache.writeFragment({
            id: "Post:" + postId,
            fragment: gql`
                fragment __ on Post {
                    points
                    voteStatus
                }
            `,
            data: {points: newPoints, voteStatus: value}
        });
    }
};

interface IUpdootSectionProps {
    post: PostSnippetFragment
}

const UpdootSection: React.FC<IUpdootSectionProps> = ({post}) => {
    const [loadingState, setLoadingState] = useState<"updoot-loading" | "downdoot-loading" | "not-loading">("not-loading");
    const [vote] = useVoteMutation()

    return (
        <Flex
            direction={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            mr={4}
        >
            <IconButton
                icon={<ChevronUpIcon/>}
                aria-label={"Updoot post"}
                colorScheme={post.voteStatus === 1 ? "green" : undefined}
                // isLoading={fetching && (operation?.variables as VoteMutationVariables)?.value === 1}
                isLoading={loadingState === "updoot-loading"}
                onClick={async () => {
                    if (post.voteStatus === 1) {
                        return
                    }
                    setLoadingState("updoot-loading")
                    await vote({
                        variables: {
                            postId: post.id,
                            value: 1
                        },
                        update: (cache) => updateAfterVote(1, post.id, cache)
                    })
                    setLoadingState("not-loading")
                }}
            />
            {post.points}
            <IconButton
                icon={<ChevronDownIcon/>}
                aria-label={"Downdoot post"}
                colorScheme={post.voteStatus === -1 ? "red" : undefined}
                // isLoading={fetching && (operation?.variables as VoteMutationVariables)?.value === -1}
                isLoading={loadingState === "downdoot-loading"}
                onClick={async () => {
                    if (post.voteStatus === -1) {
                        return
                    }
                    setLoadingState("downdoot-loading")
                    await vote({
                        variables: {
                            postId: post.id,
                            value: -1
                        },
                        update: (cache) => updateAfterVote(-1, post.id, cache)
                    })
                    setLoadingState("not-loading")
                }}
            />
        </Flex>
    );
};

export default UpdootSection;
