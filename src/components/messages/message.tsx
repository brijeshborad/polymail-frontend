import {createStandaloneToast} from "@chakra-ui/react";
import {StateType} from "@/types";
import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import dynamic from "next/dynamic";
import {Toaster} from "../common";
import {generateToasterId} from "@/utils/common.functions";
import {MessageView} from "@/components/messages/message-view";

const SelectedThreads = dynamic(() => import('@/components/threads/selected-threads').then((mod) => mod.default));
const {toast} = createStandaloneToast()
let previousToastId: string = '';

export function Message({isProjectView = false}: { isProjectView?: boolean }) {
    const {multiSelection} = useSelector((state: StateType) => state.threads);

    useEffect(() => {
        const handleShortcutKeyPress = (e: KeyboardEvent | any) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key == ',' || e.key == '<')) {
                e.preventDefault();
                navigator.clipboard.writeText(window.location.toString())
                if (previousToastId) {
                    toast.close(previousToastId);
                }
                previousToastId = generateToasterId();
                Toaster({
                    id: previousToastId,
                    type: 'success',
                    title: 'Thread URL has been copied to clipboard.',
                    desc: 'Paste this wherever you please'
                })
            }
        };
        window.addEventListener('keydown', handleShortcutKeyPress);
        return () => {
            window.removeEventListener('keydown', handleShortcutKeyPress);
        };
    }, []);

    return multiSelection && multiSelection.length > 0 ? <SelectedThreads/> :
        <MessageView isProjectView={isProjectView}/>
}
