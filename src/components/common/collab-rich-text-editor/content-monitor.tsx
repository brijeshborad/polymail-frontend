import {Event, StateType} from "@/types";
import {useCurrentEditor} from "@tiptap/react";
import {useEffect} from "react";
import {useSelector} from "react-redux";

export default function ContentMonitor() {
    const {event} = useSelector((state: StateType) => state.globalEvents) as { event: Event };
    const {editor} = useCurrentEditor()

    useEffect(() => {
        if (event && event.type === 'richtexteditor.forceUpdate') {
            // console.log('COMES HERE', event);
            editor?.commands.clearContent(false);
            editor?.commands.setContent(event.data, false)
        }
    }, [editor, event]);

    return (
        <></>
    )
}
