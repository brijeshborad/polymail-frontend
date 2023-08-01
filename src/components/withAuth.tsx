import {useRouter} from 'next/router';
import {useEffect} from 'react';
import {getStoreLocal} from "@/utils/localstorage.service";
import {Header} from "@/components/header";

export default function withAuth(Component) {
    return function ProtectedRoute({...props}) {
        const router = useRouter();
        const user = getStoreLocal('poly-user', true);
        const userIsAuthenticated = user !== null;
        useEffect(() => {
            if (!userIsAuthenticated) {
                router.push('/auth/login');
            }
        }, [userIsAuthenticated, router]);

        return (
            <>
                <Header/>
                <Component {...props} />
            </>);
    };
}
