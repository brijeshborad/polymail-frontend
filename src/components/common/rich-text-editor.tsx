import {useEffect, useRef, useState} from "react";
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
import {emojiArray} from "@/utils/common.functions";
import {useDispatch, useSelector} from "react-redux";
import {updateKeyNavigation} from "@/redux/key-navigation/action-reducer";
import {Flex} from "@chakra-ui/react";

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

    const setEditorReference = (ref: any) => {
        if (!editorRef) {
            setEditorRef(ref);
        }
    }

    useEffect(() => {
        if (editorRef) {
            if (editorRef.addEventListener && !editorRef.keyUpListenerAdded) {
                editorRef.keyUpListenerAdded = true
                editorRef.addEventListener('keyup', () => {
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
        if (typeof incomingEvent === 'object' && incomingEvent.type === 'richtexteditor.forceUpdate') {
            let finalHtmlValue = htmlToDraft(incomingEvent.data);
            setEditorState(EditorState.moveSelectionToEnd(EditorState.createWithContent(ContentState.createFromBlockArray(finalHtmlValue))));
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
                    // options: showImageOption ? ['inline', 'list', 'emoji', 'link', 'image'] : ['inline', 'list', 'emoji', 'link'],
                options: ['inline', 'list', 'emoji', 'link'],
                    inline: {
                        inDropdown: false,
                        options: ['bold', 'italic', 'strikethrough'],
                        bold: {icon: "/image/icon/bold.svg"},
                        italic: {icon: "/image/icon/italic.svg"},
                        strikethrough: {icon: "/image/icon/strikethrough.svg"},
                    },
                    // image: {
                //     previewImage: true,
                //     // icon: "/image/icon/picture.svg",
                //     uploadCallback: (file: File) => {
                //       return new Promise((resolve, reject) => {
                //         const reader = new FileReader();
                //         reader.onloadend = () => {
                //           resolve({
                //             data: {
                //               url: reader.result,
                //             },
                //           });
                //         };
                //         reader.onerror = (reason) => reject(reason);
                //         reader.readAsDataURL(file);
                //       });
                //     },
                //     alt: { present: true, mandatory: false },
                // },
                list: {
                        inDropdown: false,
                        options: ['ordered', 'unordered'],
                        unordered: {icon: "/image/icon/unordered.svg"},
                        ordered: {icon: "/image/icon/ordered.svg"},
                    },
                    emoji: {
                        // component: EmojiMenu,
                        icon: "/image/icon/emoji.svg",
                        popupClassName: 'emoji-picker',
                        emojis: emojiArray
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
                        link: {icon: "/image/icon/link.svg", className: undefined},
                    },
                }}
            />
        </Flex>
    )
}
