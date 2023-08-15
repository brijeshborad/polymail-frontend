import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {logoutUser} from "@/redux/auth/action-reducer";

export default function Logout() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(logoutUser());
    }, [dispatch])
}
