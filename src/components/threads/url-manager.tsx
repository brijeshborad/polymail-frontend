import {StateType} from "@/types";
import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {threadService} from "@/services";
import {useRouter} from "next/router";
import {Thread} from "@/models";

export function UrlManager() {
    const {
        threads,
        selectedThread,
    } = useSelector((state: StateType) => state.threads);
    const router = useRouter();

    useEffect(() => {
        if (threads && threads.length > 0 && !selectedThread && router.query.thread) {
            let findThread = threads.find((item: Thread) => item.id === router.query.thread);
            if (findThread) {
                threadService.setSelectedThread(findThread);
            }
        }
    }, [router.query.thread, selectedThread, threads])

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

    return (
        <></>
    )
}
