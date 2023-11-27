import {Flex} from "@chakra-ui/react";
import {StateType} from "@/types";
import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {SkeletonLoader} from "@/components/loader-screen/skeleton-loader";
import dynamic from "next/dynamic";
import {threadService} from "@/services";
import {SideBarSubTab} from "@/components/threads/side-bar-sub-tab";

const ThreadsSideBarList = dynamic(() => import("@/components/threads").then(mod => mod.ThreadsSideBarList));

export function ThreadsSideBarTab() {
    const {
        threads,
        isLoading,
        success: threadListSuccess,
        tabValue,
    } = useSelector((state: StateType) => state.threads)
    const {isLoading: summaryIsLoading, syncingEmails} = useSelector((state: StateType) => state.commonApis);

    useEffect(() => {
        if (threadListSuccess) {
            if (threads && threads.length) {
                threadService.setThreads(threads)
            }
        }
    }, [threadListSuccess, threads])

    useEffect(() => {
        if (isLoading && threads && threads.length >= 1) {
            threadService.setThreadState({isLoading: false});
        }
    }, [isLoading, threads])

    return (
        <>
            <SideBarSubTab/>
            {(isLoading || summaryIsLoading || syncingEmails) && (
                <Flex direction="column" mt={3} padding={"0 6px"}>
                    <SkeletonLoader skeletonLength={15}/>
                </Flex>
            )}
            <ThreadsSideBarList tab={tabValue!}/>
        </>
    )
}
