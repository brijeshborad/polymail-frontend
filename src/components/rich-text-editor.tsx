import {useCallback, useEffect, useState} from "react";
import dynamic from 'next/dynamic'

const Editor = dynamic(
    () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
    {ssr: false}
)
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {RichTextEditorProps} from "@/types";
import {EditorState, convertToRaw, ContentState} from 'draft-js';
import draftToHtml from "draftjs-to-html";

export default function RichTextEditor({onChange, placeholder, className}: RichTextEditorProps) {
    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());

    const updateParentComponent = useCallback(() => {
        if (onChange && editorState?.getCurrentContent().getPlainText().trim()) {
            onChange(draftToHtml(convertToRaw(editorState?.getCurrentContent() as ContentState)));
        }
        // eslint-disable-next-line
    }, [editorState])

    useEffect(() => {
        updateParentComponent();
    }, [updateParentComponent])

    // useEffect(() => {
    //     if (props.value) {
    //         setEditorState(EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(props.value) as any)));
    //     }
    // }, [props, props.value])

    return (
        <Editor
            editorState={editorState}
            placeholder={placeholder}
            wrapperClassName={className}
            onEditorStateChange={setEditorState}
        />
    )
}
