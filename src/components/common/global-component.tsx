import GlobalEvents from "@/components/common/global-events";
import {CommonApiComponents} from "@/components/common/common-api-components";
import React from "react";
import {SocketEvents} from "@/components/common/socket-events";

export function GlobalComponent() {
    return (
        <>
            <GlobalEvents />
            <CommonApiComponents/>
            <SocketEvents/>
        </>
    )
}
