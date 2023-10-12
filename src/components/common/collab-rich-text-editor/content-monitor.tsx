import {Event, StateType} from "@/types";
import {useCurrentEditor} from "@tiptap/react";
import {useEffect} from "react";
import {useSelector} from "react-redux";

export default function ContentMonitor() {
    const {event} = useSelector((state: StateType) => state.globalEvents) as { event: Event };
    const {editor} = useCurrentEditor()

    useEffect(() => {
        console.log('event', event);
        if (event && event.type === 'richtexteditor.forceUpdate') {
            editor?.commands.clearContent(false);
            editor?.commands.setContent(event.data, false)
        }
        if (event && event.type === 'richtexteditor.forceUpdateWithOnChange') {
            editor?.commands.clearContent(false);
            editor?.commands.setContent(event.data, true)
        }
        if (event && event.type === 'richtexteditor.forceUpdateInitial') {
            editor?.commands.clearContent(false);
            editor?.commands.setContent(event.data, false)
            editor?.commands.focus('start')
        }

        if (event && event.type === 'richtexteditor.focus') {
            if (editor && !editor.isFocused) {
                editor?.commands.focus('start')
            }
        }

        if (event && event.type === 'richtexteditor.discard') {
            editor?.commands.clearContent(true);
            editor?.commands.blur()
        }
    }, [editor, event]);

    return (
        <></>
    )
}
