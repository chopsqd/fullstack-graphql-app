import React from 'react';
import {Box, Link, Flex, Spinner, Button} from "@chakra-ui/react";
import NextLink from "next/link";
import {useLogoutMutation, useMeQuery} from "../generated/graphql";
import {isServer} from "../utils/isServer";

const NavBar = () => {
    const [{fetching: logoutFetching}, logout] = useLogoutMutation()
    const [{data, fetching}] = useMeQuery({
        pause: isServer()
    })

    if (fetching) {
        return <Box>
            <Spinner />
        </Box>
    }

    if (data?.me) {
        return <Flex bg="lightsalmon" p="4" gap={5} align={"center"}>
            <Box>{data.me.username}</Box>
            <Button
                variant="link"
                onClick={logout}
                isLoading={logoutFetching}
            >
                Logout
            </Button>
        </Flex>
    }

    return (
        <Flex zIndex={1} bg="lightsalmon" p="4" top="0" position={"sticky"} align={"center"}>
            <Box ml="auto">
                <NextLink href={'/login'}>
                    <Link mr="2">Login</Link>
                </NextLink>
                <NextLink href={'/register'}>
                    <Link>Register</Link>
                </NextLink>
            </Box>
        </Flex>
    );
};

export default NavBar;
