import {StateType} from "@/types";
import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {commonService, draftService, threadService} from "@/services";
import {useRouter} from "next/router";
import {Thread} from "@/models";

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

    useEffect(() => {
        if (threads && threads.length > 0 && !selectedThread && router.query.thread) {
            if (!isThreadSearched) {
                let findThread = threads.find((item: Thread) => item.id === router.query.thread);
                if (findThread) {
                    threadService.setSelectedThread(findThread);
                }
            }
        }
    }, [router.query.thread, selectedThread, threads, isThreadSearched])

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
    }, [isComposing, router.asPath]);

    useEffect(() => {
        if (selectedThread) {
            commonService.updateUserOnlineStatus(selectedThread);
        }
    }, [selectedThread]);

    return (
        <></>
    )
}
