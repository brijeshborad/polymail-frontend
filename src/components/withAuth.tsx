import {useRouter} from 'next/router';
import React, {useEffect} from 'react';
import LocalStorageService from "@/utils/localstorage.service";
import {Header} from "@/components/header";

export default function withAuth(ProtectedComponent: any) {
    return function ProtectedRoute({...props}) {
        const router = useRouter();
        const user = LocalStorageService.updateUser('get');
        const userIsAuthenticated = user !== null;
        useEffect(() => {
            if (!userIsAuthenticated) {
                router.push('/auth/login');
            }
        }, [userIsAuthenticated, router]);

        return (
            <>
                <Header/>
                <ProtectedComponent {...props} />
            </>);
    };
}
