import React from "react";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import dynamic from "next/dynamic";
import {MessageBoxView} from "@/components/messages/message-view/message-box-view";

const ComposeBox = dynamic(() => import('@/components/inbox/compose-box').then(mod => mod.ComposeBox));

export function MessageView({isProjectView = false}: { isProjectView?: boolean }) {
    const {isComposing} = useSelector((state: StateType) => state.commonApis);
    return (
        <>
            <MessageBoxView isProjectView={isProjectView}/>
            {isComposing && <ComposeBox/>}
        </>
    )
}
