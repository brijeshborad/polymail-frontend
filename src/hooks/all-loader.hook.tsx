import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {StateType} from "@/types";

export const useAllLoader = function () {
    const {isLoading: threadLoading} = useSelector((state: StateType) => state.threads);
    const {isLoading: accountLoading} = useSelector((state: StateType) => state.accounts);
    const {isLoading: organizationLoading} = useSelector((state: StateType) => state.organizations);
    const {isLoading: usersProfilePictureLoading} = useSelector((state: StateType) => state.users);
    const {isLoading: projectsLoading} = useSelector((state: StateType) => state.projects);
    const {isLoading: summaryLoading, syncingEmails} = useSelector((state: StateType) => state.commonApis);

    const [isLoaderShow, setIsLoaderShow] = useState<boolean>(false);

    useEffect(() => {
        if (!threadLoading && !accountLoading && !organizationLoading && !usersProfilePictureLoading && !projectsLoading && !summaryLoading && !syncingEmails) {
            setIsLoaderShow(false)
        } else {
            setIsLoaderShow(true)
        }
    }, [threadLoading, accountLoading, organizationLoading, usersProfilePictureLoading, projectsLoading, summaryLoading, syncingEmails])

    return isLoaderShow;
};
