import {useRouter} from 'next/router';
import React, {useEffect} from 'react';
import LocalStorageService from "@/utils/localstorage.service";
import {Header} from "@/components/header";
import useWebSocket from "react-use-websocket";
import {User} from "@/models";

export default function withAuth(ProtectedComponent: any) {
    return function ProtectedRoute({...props}) {
        const router = useRouter();
        const user: User | null = LocalStorageService.updateUser('get');
        const userIsAuthenticated = user !== null;
        useEffect(() => {
            if (!userIsAuthenticated) {
                router.push('/auth/signup');
            }
        }, [userIsAuthenticated, router]);

        const {lastMessage} = useWebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}?token=${user?.token}`, {share: true})
        console.log(lastMessage);

        return (
            <>
                <Header/>
                <ProtectedComponent {...props} />
            </>);
    };
}
