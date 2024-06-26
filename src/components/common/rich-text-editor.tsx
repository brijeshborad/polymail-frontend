import React, {useEffect, useRef, useState} from "react";
import dynamic from 'next/dynamic'

const Editor = dynamic(
    () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
    {ssr: false}
)
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {RichTextEditorProps, StateType} from "@/types";
import {
    EditorState,
    convertToRaw,
    ContentState,
} from 'draft-js';
import draftToHtml from "draftjs-to-html";
import {useDispatch, useSelector} from "react-redux";
import {updateKeyNavigation} from "@/redux/key-navigation/action-reducer";
import {Flex} from "@chakra-ui/react";
import {CustomOption} from "@/components/common/custom-emoji-option";

let htmlToDraft: any = null;
if (typeof window === 'object') {
    htmlToDraft = require('html-to-draftjs').default;
}

export function RichTextEditor({onChange, placeholder, className, value, hideToolBar}: RichTextEditorProps) {
    const containerRef: any = useRef(null)
    const dispatch = useDispatch()
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
    const [isContentEdited, setIsContentEdited] = useState<boolean>(false);
    const [editorRef, setEditorRef] = useState<any | null>(null);

    useEffect(() => {
        if (onChange && isContentEdited) { // editorState?.getCurrentContent().getPlainText().trim()
            onChange(draftToHtml(convertToRaw(editorState?.getCurrentContent() as ContentState)));
        }
        // eslint-disable-next-line
    }, [editorState, isContentEdited])

    useEffect(() => {
        if (!isContentEdited) {
            if (editorState?.getLastChangeType()) {
                setIsContentEdited(true);
            }
        }
    }, [editorState, value, isContentEdited])

    const setEditorReference = (ref: any) => {
        if (!editorRef) {
            setEditorRef(ref);
        }
    }

    useEffect(() => {
        if (editorRef) {
            if (editorRef.addEventListener && !editorRef.keyUpListenerAdded) {
                editorRef.keyUpListenerAdded = true
                editorRef.addEventListener('keydown', (event: KeyboardEvent | any) => {
                    if (event.ctrlKey || event.metaKey || event.shiftKey) {
                        return;
                    }
                    if (!isContentEdited) {
                        setIsContentEdited(true);
                    }
                })
            }
        }
        return () => {
            if (editorRef) {
                editorRef.keyUpListenerAdded = false;
            }
        }
    }, [editorRef, isContentEdited])

    useEffect(() => {
        if (value && !isContentEdited) {
            let finalHtmlValue = htmlToDraft(value);
            setEditorState(EditorState.moveSelectionToEnd(EditorState.createWithContent(ContentState.createFromBlockArray(finalHtmlValue))));
        }
    }, [value, isContentEdited])

    const closeEditorDropDowns = () => {
        const emojiWrapper = (containerRef && containerRef.current) ? containerRef.current.getElementsByClassName('rdw-emoji-wrapper') : null
        if (emojiWrapper && emojiWrapper[0]) {
            const emojiButton = emojiWrapper[0].getElementsByClassName('rdw-option-wrapper')[0]
            const isEmojiModalOpen = emojiWrapper[0].getElementsByClassName('emoji-picker')[0]

            if (isEmojiModalOpen) {
                if (emojiButton) emojiButton.click()
            }
        }

        const linkWrapper = (containerRef && containerRef.current) ? containerRef.current.getElementsByClassName('rdw-link-wrapper') : null
        if (linkWrapper && linkWrapper[0]) {
            const linkButton = linkWrapper[0].getElementsByClassName('rdw-option-wrapper')[0]
            const isLinkModalOpen = linkWrapper[0].getElementsByClassName('emoji-picker')[0]

            if (isLinkModalOpen) {
                if (linkButton) linkButton.click()
            }
        }
    }

    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            closeEditorDropDowns()
        }
        if (typeof incomingEvent === 'object' && incomingEvent.type === 'editor.forceUpdate') {
            let finalHtmlValue = htmlToDraft(incomingEvent.data.body);
            setEditorState(EditorState.moveSelectionToEnd(EditorState.createWithContent(ContentState.createFromBlockArray(finalHtmlValue))));
            setIsContentEdited(false);
        }
    }, [incomingEvent])

    /**
     * Detects clicks outside of the component and closes it (if open)
     */
    useEffect(() => {
        function handleClickOutside(event: any) {
            const current: any = containerRef.current

            if (current && !current.contains(event.target)) {
                closeEditorDropDowns()
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [containerRef]);

    const handleLinkCallback = ({
                                    title,
                                    target,
                                    targetOption
                                }: { title: string, target: string, targetOption?: string }) => {
        let url = target
        const httpValidation = new RegExp("^(http|https)://", "i"); //Check Url has Http or not
        let validUrl = httpValidation.test(url);
        if (!validUrl) {
            url = "https://" + url;
        }
        return {title: title, target: url, targetOption: targetOption}
    }

    return (
        <Flex ref={containerRef}>
            <Editor
                placeholder={placeholder}
                editorState={editorState}
                wrapperClassName={className}
                editorRef={setEditorReference}
                editorClassName={'default-editor-css'}
                onEditorStateChange={setEditorState}
                toolbarHidden={hideToolBar ? hideToolBar : false}
                onFocus={() => dispatch(updateKeyNavigation({isEnabled: false}))}
                onBlur={() => dispatch(updateKeyNavigation({isEnabled: true}))}
                toolbar={{
                    options: ['inline', 'list', 'link'],
                    inline: {
                        inDropdown: false,
                        options: ['bold', 'italic'],
                        bold: {icon: "/image/icon/bold.svg"},
                        italic: {icon: "/image/icon/italic.svg"}
                    },
                    list: {
                        inDropdown: false,
                        options: ['ordered', 'unordered'],
                        unordered: {icon: "/image/icon/unordered.svg"},
                        ordered: {icon: "/image/icon/ordered.svg"},
                    },
                    link: {
                        inDropdown: false,
                        className: 'link-class',
                        component: undefined,
                        popupClassName: 'emoji-picker',
                        dropdownClassName: undefined,
                        showOpenOptionOnHover: true,
                        defaultTargetOption: '_self',
                        options: ['link'],
                        link: {icon: "/image/icon/link.svg", className: 'link-class', popupClassName: 'emoji-picker'},
                        linkCallback: handleLinkCallback
                    }
                }}
                toolbarCustomButtons={[<CustomOption key="custom-option" onChange={onChange}
                                                     editorState={editorState}/>]}
            />
        </Flex>
    )
}
