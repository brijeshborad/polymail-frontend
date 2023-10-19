// import {useDispatch} from "react-redux";
import {useEffect} from "react";
// import {logoutUser} from "@/redux/auth/action-reducer";
import LocalStorageService from "@/utils/localstorage.service";
import Router from "next/router";
import {accountService, authService, organizationService} from "@/services";

export default function Logout() {
    // const dispatch = useDispatch();

    useEffect(() => {
        // dispatch(logoutUser());
        authService.setUser(null);
        accountService.setSelectedAccount(null);
        organizationService.setSelectedOrganization(null);
        setTimeout(() => {
            LocalStorageService.clearStorage();
            Router.push('/onboarding/login');
        }, 1000);
    }, [])
}
