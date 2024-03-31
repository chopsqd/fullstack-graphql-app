import React from 'react';
import {Box, Button, Flex, Link, Spinner} from "@chakra-ui/react";
import NextLink from "next/link";
import {useLogoutMutation, useMeQuery} from "../generated/graphql";
import {isServer} from "../utils/isServer";
import {useRouter} from "next/router";
import {useApolloClient} from "@apollo/client";

const NavBar = () => {
    const router = useRouter()
    const apolloClient = useApolloClient()
    const [logout, {loading: logoutFetching}] = useLogoutMutation()
    const {data, loading} = useMeQuery({
        skip: isServer()
    })

    if (loading) {
        return <Box>
            <Spinner/>
        </Box>
    }

    if (data?.me) {
        return <Flex bg="lightsalmon" p="4" gap={5} align={"center"}>
            <Box>{data.me.username}</Box>
            <Button
                variant="link"
                onClick={async () => {
                    await logout()
                    await apolloClient.resetStore()
                }}
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
