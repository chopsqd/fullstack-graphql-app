import {useEffect} from "react";
import {useRouter} from "next/router";
import {useMeQuery} from "../generated/graphql";

export const useIsAuth = () => {
    const router = useRouter()
    const [{data, fetching}] = useMeQuery()

    useEffect(() => {
        if (!fetching && !data?.me) {
            router.replace("/login")
        }
    }, [fetching, data, router]);
}
