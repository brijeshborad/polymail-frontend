import {useEffect} from "react";
import LocalStorageService from "@/utils/localstorage.service";
import Router from "next/router";
import {accountService, authService, organizationService} from "@/services";
import {createStandaloneToast} from "@chakra-ui/react";

const {toast} = createStandaloneToast()

export default function Logout() {
    useEffect(() => {
        toast.closeAll();
        authService.setUser(null);
        accountService.setSelectedAccount(null);
        organizationService.setSelectedOrganization(null);
        LocalStorageService.clearStorage();
        setTimeout(() => {
            Router.push('/onboarding/login');
        }, 1000);
    }, [])
}
