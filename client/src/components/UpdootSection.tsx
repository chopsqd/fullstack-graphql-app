import React, {useState} from 'react';
import {Flex, IconButton} from "@chakra-ui/react";
import {ChevronDownIcon, ChevronUpIcon} from "@chakra-ui/icons";
import {PostSnippetFragment, useVoteMutation, VoteMutationVariables} from "../generated/graphql";

interface IUpdootSectionProps {
    post: PostSnippetFragment
}

const UpdootSection: React.FC<IUpdootSectionProps> = ({post}) => {
    const [loadingState, setLoadingState] = useState<"updoot-loading" | "downdoot-loading" | "not-loading">("not-loading");
    const [, vote] = useVoteMutation()

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
                    await vote({postId: post.id, value: 1})
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
                    await vote({postId: post.id, value: -1})
                    setLoadingState("not-loading")
                }}
            />
        </Flex>
    );
};

export default UpdootSection;
