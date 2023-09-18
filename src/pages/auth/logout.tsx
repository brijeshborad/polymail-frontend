import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {logoutUser} from "@/redux/auth/action-reducer";
import LocalStorageService from "@/utils/localstorage.service";
import Router from "next/router";

export default function Logout() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(logoutUser());
        setTimeout(() => {
            LocalStorageService.clearStorage();
            Router.push('/onboarding');
        }, 1000);
    }, [dispatch])
}
