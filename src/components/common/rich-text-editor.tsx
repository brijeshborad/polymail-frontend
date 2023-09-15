import {useCallback, useEffect, useState} from "react";
import dynamic from 'next/dynamic'

const Editor = dynamic(
    () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
    {ssr: false}
)
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {RichTextEditorProps} from "@/types";
import {
    EditorState,
    convertToRaw,
    ContentState,
} from 'draft-js';
import draftToHtml from "draftjs-to-html";
import {emojiArray} from "@/utils/common.functions";

let htmlToDraft: any = null;
if (typeof window === 'object') {
    htmlToDraft = require('html-to-draftjs').default;
}

export function RichTextEditor({onChange, placeholder, className, value, initialUpdated}: RichTextEditorProps) {
    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
    const updateParentComponent = useCallback(() => {
        if (onChange) { // editorState?.getCurrentContent().getPlainText().trim()
            onChange(draftToHtml(convertToRaw(editorState?.getCurrentContent() as ContentState)));
        }
        // eslint-disable-next-line
    }, [editorState])

    useEffect(() => {
        updateParentComponent();
    }, [updateParentComponent])

    useEffect(() => {
        if (value) {
            if (!initialUpdated) {
                setEditorState(EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(value))));
            }
        }
    }, [value, initialUpdated])


    return (
        <Editor
            placeholder={placeholder}
            editorState={editorState}
            wrapperClassName={className}
            editorClassName={'default-editor-css'}
            onEditorStateChange={setEditorState}

            toolbar={{
                options: ['inline', 'list', 'emoji', 'link'],
                inline: {
                    inDropdown: false,
                    options: ['bold', 'italic', 'strikethrough'],
                    bold: {icon: "/image/icon/bold.svg"},
                    italic: {icon: "/image/icon/italic.svg"},
                    strikethrough: {icon: "/image/icon/strikethrough.svg"},
                },
                list: {
                    inDropdown: false,
                    options: ['ordered', 'unordered'],
                    unordered: {icon: "/image/icon/unordered.svg"},
                    ordered: {icon: "/image/icon/ordered.svg"},
                },
                emoji: {
                    icon: "/image/icon/emoji.svg",
                    popupClassName: 'emoji-picker',
                    emojis: emojiArray,
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
                    link: {icon: "/image/icon/link.svg", className: undefined },
                    linkCallback: undefined
                },
            }}
        />
    )
}
