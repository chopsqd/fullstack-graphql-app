import {useEffect} from "react";
import {useRouter} from "next/router";
import {useMeQuery} from "../generated/graphql";

export const useIsAuth = () => {
    const router = useRouter()
    const {data, loading} = useMeQuery()

    useEffect(() => {
        if (!loading && !data?.me) {
            router.replace("/login?next=" + router.pathname)
        }
    }, [loading, data, router]);
}
