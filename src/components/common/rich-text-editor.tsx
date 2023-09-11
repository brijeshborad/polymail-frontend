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

let htmlToDraft: any = null;
if (typeof window === 'object') {
    htmlToDraft = require('html-to-draftjs').default;
}

export function RichTextEditor({onChange, placeholder, className, value, initialUpdated, hideToolBar = false}: RichTextEditorProps) {
    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
    const emojiArray = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👵", "🧓", "👴", "👮", "👷", "💂", "🕵️‍♂️", "👩‍⚕️", "👨‍⚕️", "👩‍🌾", "👨‍🌾", "👩‍🍳", "👨‍🍳", "👩‍🎓", "👨‍🎓", "👩‍🎤", "👨‍🎤", "👩‍🏫", "👨‍🏫", "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🦝", "🐻", "🐨", "🐼", "🦁", "🐯", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🦍", "🦧", "🐔", "🍔", "🍟", "🍕", "🌭", "🍿", "🧂", "🍞", "🥖", "🥐", "🥨", "🥯", "🥞", "🧇", "🍳", "🍗", "🍖", "🥩", "🍔", "🍟", "🍕", "🌭", "🍿", "🧂", "🚗", "🚕", "🚆", "🚇", "🚈", "🚂", "🚊", "🚝", "🚄", "🚅", "🚈", "🚞", "🚋", "🚲", "🛴", "🛵", "🏍️", "🚨", "🚍", "🚌", "🚒", "🚑", "🚓", "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🥏", "🥅", "🏒", "🏑", "🏏", "🥋", "🥊", "🥇", "🥈", "🥉", "🏆"]
    const updateParentComponent = useCallback(() => {
        if (onChange && editorState?.getCurrentContent().getPlainText().trim()) {
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
            toolbarHidden={hideToolBar}
            toolbar={{
                options: ['inline', 'list', 'emoji'],
                inline: {
                    inDropdown: false,
                    options: ['bold', 'italic', 'strikethrough'],
                    bold: {icon: "/image/icon/bold-icon.png"},
                    italic: {icon: "/image/icon/italic-icon.png"},
                    strikethrough: {icon: "/image/icon/strikethrough.png"},
                },
                list: {
                    inDropdown: false,
                    options: ['ordered', 'unordered'],
                    unordered: {icon: "/image/icon/ordered.png"},
                    ordered: {icon: "/image/icon/unordered.png"},
                },
                emoji: {
                    icon: "/image/icon/emoji.png",
                    className: undefined,
                    component: undefined,
                    popupClassName: 'emoji-picker',
                    emojis: emojiArray,
                },
            }}
        />
    )
}
