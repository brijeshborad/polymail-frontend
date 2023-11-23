import {Flex} from "@chakra-ui/react";
import {SkeletonLoader} from "@/components/loader-screen/skeleton-loader";
import {InboxLoader} from "@/components/loader-screen/inbox-loader";
import React from "react";
import {useSelector} from "react-redux";
import {StateType} from "@/types";

export function MessageBoxLoader() {
    const {syncingEmails} = useSelector((state: StateType) => state.commonApis);
    return (
        <Flex justifyContent={'center'} alignItems={'center'} flexDir={'column'}
              height={'100%'}>
            {!syncingEmails && <Flex direction={'column'} gap={2} flex={1} w={'100%'}>
                <SkeletonLoader skeletonLength={1} height={'100%'}/>
            </Flex>}
            {syncingEmails && <InboxLoader loaderPercentage={syncingEmails}/>}
        </Flex>
    )
}
