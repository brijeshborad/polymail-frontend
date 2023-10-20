import {Event, StateType} from "@/types";
import {useCurrentEditor} from "@tiptap/react";
import {useEffect} from "react";
import {useSelector} from "react-redux";
import {getProjectBanner} from "@/utils/common.functions";
import {globalEventService} from "@/services";

export default function ContentMonitor(props: any) {
    const {event} = useSelector((state: StateType) => state.globalEvents) as { event: Event };
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {editor} = useCurrentEditor()

    function loadHtmlAndRemoveProjectBanner(body: string) {
        let createDivElement = document.createElement('div');
        createDivElement.id = 'content-editor-removals';
        document.getElementsByTagName('body')[0].appendChild(createDivElement);
        createDivElement.innerHTML = body;
        let findPGap = createDivElement.querySelector('#project-banner-gap');
        let findProjectBanner = createDivElement.querySelector('#project-banner');
        if (findPGap) {
            findPGap.remove();
        }
        if (findProjectBanner) {
            findProjectBanner.remove();
        }
        let finalBody = createDivElement.innerHTML;
        createDivElement.remove();
        return finalBody;
    }

    useEffect(() => {
        if (event && event.type === 'richtexteditor.forceUpdate') {
            editor?.commands.clearContent(false);
            editor?.commands.setContent(event.data.body, false)
            if (event.data.callBack) {
                event.data.callBack()
            }
        }
        if (event && event.type === 'richtexteditor.forceUpdateWithOnChange') {
            editor?.commands.clearContent(false);
            editor?.commands.setContent(event.data.body, true)
            if (event.data.callBack) {
                event.data.callBack()
            }
        }
        if (event && event.type === 'richtexteditor.forceUpdateInitial') {
            editor?.commands.clearContent(false);
            editor?.commands.setContent(event.data.body, false)
            editor?.commands.focus('start');
            if (event.data.callBack) {
                event.data.callBack()
            }
        }

        if (event && event.type === 'richtexteditor.focus') {
            globalEventService.fireEvent('iframe.clicked');
            if (editor && !editor.isFocused) {
                setTimeout(() => {
                    editor?.commands.focus('start')
                }, 100)
            }
        }

        if (event && event.type === 'richtexteditor.blur') {
            if (editor && editor.isFocused) {
                editor?.commands.blur();
            }
        }

        if (event && event.type === 'richtexteditor.discard') {
            props.provider.document.destroy();
            editor?.commands.clearContent(true);
            editor?.commands.blur()
        }

        if (event && event.type === 'richtexteditor.addRemoveProject') {
            let getHtml = editor?.getHTML() || '';
            let updatedHtml = '';
            if (event.data.body === 'add') {
                updatedHtml = getHtml + getProjectBanner(selectedAccount);
            } else {
                updatedHtml = loadHtmlAndRemoveProjectBanner(getHtml);
            }
            editor?.commands.clearContent(false);
            editor?.commands.setContent(updatedHtml, true)
        }
    }, [editor, event, selectedAccount]);

    return (
        <></>
    )
}
