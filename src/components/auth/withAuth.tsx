import {useRouter} from 'next/router';
import React, {useEffect} from 'react';
import LocalStorageService from "@/utils/localstorage.service";
import {User} from "@/models";
import {Flex} from "@chakra-ui/react";

export default function withAuth(ProtectedComponent: any) {
    return function ProtectedRoute({...props}) {
        const router = useRouter();
        const user: User | null = LocalStorageService.updateUser('get');

        const userIsAuthenticated = user !== null;
        useEffect(() => {
            if (!userIsAuthenticated) {
                router.push('/onboarding');
            }
        }, [userIsAuthenticated, router]);

        return (
            <>
                <Flex direction={'column'} flex={1}>
                    <ProtectedComponent {...props} />
                </Flex>
            </>);
    };
}
