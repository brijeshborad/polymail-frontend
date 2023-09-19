import {useCallback, useEffect} from "react";
import {getAllProjects} from "@/redux/projects/action-reducer";
import {useDispatch} from "react-redux";
import {getAllAccount} from "@/redux/accounts/action-reducer";
import {getAllOrganizations} from "@/redux/organizations/action-reducer";
import {getProfilePicture} from "@/redux/users/action-reducer";

export function CommonApiComponents() {
    const dispatch = useDispatch();

    const getAllCommonApis = useCallback(() => {
        dispatch(getAllProjects());
        dispatch(getAllAccount());
        dispatch(getAllOrganizations());
        dispatch(getProfilePicture({}));
    }, [dispatch]);

    useEffect(() => {
        getAllCommonApis();
    }, [getAllCommonApis]);

    return null
}
