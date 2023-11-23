import {StateType} from "@/types";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {commonService, domService, draftService, threadService} from "@/services";
import {useRouter} from "next/router";
import {Thread} from "@/models";
import {useWindowSize} from "@/hooks/window-resize.hook";

export function UrlManager() {
    const {
        threads,
        selectedThread,
        isThreadSearched
    } = useSelector((state: StateType) => state.threads);
    const {
        isComposing
    } = useSelector((state: StateType) => state.commonApis);
    const router = useRouter();
    const [allowAutoSelect, setAllowAutoSelect] = useState<boolean>(true);
    const [width] = useWindowSize();

    useEffect(() => {
        setAllowAutoSelect(width > 991);
        commonService.setCommonState({allowThreadSelection: width > 991});
    }, [width])

    useEffect(() => {
        if (threads && threads.length > 0 && !selectedThread && router.query.thread) {
            if (!isThreadSearched && allowAutoSelect) {
                let findThread = threads.find((item: Thread) => item.id === router.query.thread);
                if (findThread) {
                    threadService.setSelectedThread(findThread);
                }
            }
        }
    }, [router.query.thread, selectedThread, threads, isThreadSearched, allowAutoSelect])

    useEffect(() => {
        if (selectedThread) {
            if (!router.query.thread || router.query.thread !== selectedThread.id) {
                router.push(
                    {
                        pathname: router.pathname.includes('projects') ? `/projects/${router.query.project}` : '/inbox',
                        query: {thread: selectedThread.id}
                    },
                    undefined,
                    {shallow: true}
                )
            }
        }
    }, [router, selectedThread])

    useEffect(() => {
        if (isComposing) {
            draftService.saveDraftToResume()
        }
    }, [isComposing]);

    useEffect(() => {
        if (selectedThread) {
            domService.addOrRemoveSelectedThreadClasses();
            commonService.updateUserOnlineStatus(selectedThread);
        } else {
            domService.addOrRemoveSelectedThreadClasses(true);
        }
    }, [selectedThread]);

    return (
        <></>
    )
}
