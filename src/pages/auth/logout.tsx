import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {logoutUser} from "@/redux/auth/action-reducer";
import LocalStorageService from "@/utils/localstorage.service";
import Router from "next/router";
import {updateAccountState} from "@/redux/accounts/action-reducer";
import {updateOrganizationState} from "@/redux/organizations/action-reducer";

export default function Logout() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(logoutUser());
        dispatch(updateAccountState({selectedAccount: null}));
        dispatch(updateOrganizationState({selectedOrganization: null}));
        setTimeout(() => {
            LocalStorageService.clearStorage();
            Router.push('/onboarding/login');
        }, 1000);
    }, [dispatch])
}
