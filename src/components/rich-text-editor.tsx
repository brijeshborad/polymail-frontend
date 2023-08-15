import {useCallback, useEffect, useState} from "react";
import dynamic from 'next/dynamic'

const Editor = dynamic(
    () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
    {ssr: false}
)
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {RichTextEditorProps} from "@/types";
import {EditorState, convertToRaw, ContentState, convertFromHTML} from 'draft-js';
import draftToHtml from "draftjs-to-html";

export default function RichTextEditor({onChange, placeholder, className, value}: RichTextEditorProps) {
    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
    const [sampleEditorContent, setSampleEditorContent] = useState<EditorState>(EditorState.createEmpty());
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
            setSampleEditorContent(EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(value) as any)));
        }
    }, [value])

    return (
        <Editor
            placeholder={placeholder}
            wrapperClassName={className}
            onEditorStateChange={setEditorState}
            defaultEditorState={sampleEditorContent}
            toolbar={{
                options: ['inline', 'link', 'list', 'emoji'],
                inline: {
                    inDropdown: false,
                    options: ['bold', 'italic', 'strikethrough'],
                },
                link: {
                    inDropdown: false,
                    options: ['link'],
                },
                list: {
                    inDropdown: false,
                    options: ['unordered', 'ordered'],
                },
                emoji: {
                    className: undefined,
                    component: undefined,
                    popupClassName: undefined,
                    emojis: emojiArray,
                },
            }}
        />
    )
}
