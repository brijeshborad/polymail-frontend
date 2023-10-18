import {Box} from "@chakra-ui/react"
import {useCurrentEditor} from "@tiptap/react"
import Image from "next/image"
import {useCallback, useState} from "react"
import ToolbarUrl from "./toolbar-url"
import {CollabRichTextEditorToolbarType} from "@/types/props-types/collab-rich-text-toolbar.types"
import ToolbarEmoji from "@/components/common/collab-rich-text-editor/toolbar-emoji";

export default function CollabRichTextEditorToolbar({
                                                        beforeToolbar,
                                                        afterToolbar,
                                                        extendToolbar,
                                                        isVisible
                                                    }: CollabRichTextEditorToolbarType) {
    const {editor} = useCurrentEditor()
    const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false);
    const [isEmojiMenuOpen, setIsEmojiMenuOpen] = useState(false);

    const setLink = useCallback((url?: string) => {
        if (!editor) return
        const previousUrl = editor.getAttributes('link').href

        if (!url) {
            url = previousUrl
        }
        // cancelled
        if (url === null) {
            return
        }

        if (editor) {
            if (url === '') {
                editor.chain().focus().extendMarkRange('link').unsetLink().run()
                return
            }

            // update link
            if (url) {
                editor.chain().focus().extendMarkRange('link').setLink({href: url}).run()
            }
        }
        // empty
    }, [editor])

    const setEmoji = useCallback((emoji?: string) => {
        if (!editor) return

        editor.commands.insertContent([
            {
                type: 'text',
                text: emoji
            }
        ])
        editor.view.dom.focus()
    }, [editor])


    if (!editor) {
        return null
    }

    return (
        <>
            {beforeToolbar && beforeToolbar}
            <Box position={'absolute'} display={isVisible ? 'flex': 'none'} gap={4} bottom={3} zIndex={9} alignItems={'center'}
                 className={`tiptap-toolbar show`}>
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleBold()
                            .run()
                    }
                    className={editor.isActive('bold') ? 'is-active' : ''}
                >
                    <Image priority src="/image/icon/bold.svg" alt="Bold" width={16} height={16}/>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleItalic()
                            .run()
                    }
                    className={editor.isActive('italic') ? 'is-active' : ''}
                >
                    <Image priority src="/image/icon/italic.svg" alt="italic" width={16} height={16}/>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleStrike()
                            .run()
                    }
                    className={editor.isActive('strike') ? 'is-active' : ''}
                >
                    <Image priority src="/image/icon/strikethrough.svg" alt="strikethrough" width={16} height={16}/>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'is-active' : ''}
                >
                    <Image priority src="/image/icon/ordered.svg" alt="ordered list" width={16} height={16}/>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'is-active' : ''}
                >
                    <Image priority src="/image/icon/unordered.svg" alt="unordered list" width={16} height={16}/>
                </button>

                <div style={{width: 1, height: '16px', backgroundColor: '#E5E7EB'}}/>

                <ToolbarEmoji
                    editor={editor}
                    isOpen={isEmojiMenuOpen}
                    onChangeVisibility={setIsEmojiMenuOpen}
                    onChange={setEmoji}
                />

                <ToolbarUrl
                    editor={editor}
                    isOpen={isLinkMenuOpen}
                    onChangeVisibility={setIsLinkMenuOpen}
                    onChange={setLink}
                />
                {extendToolbar && extendToolbar}
            </Box>
            {afterToolbar && afterToolbar}
        </>
    )
}
