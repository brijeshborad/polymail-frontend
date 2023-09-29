import { Box } from "@chakra-ui/react"
import { useCurrentEditor } from "@tiptap/react"
import Image from "next/image"
import { useCallback, useState } from "react"
import ToolbarUrl from "./toolbar-url"
import { CollabRichTextEditorToolbarType } from "@/types/props-types/collab-rich-text-toolbar.types"

export default function CollabRichTextEditorToolbar({ isToolbarVisible = false, beforeToolbar, afterToolbar, extendToolbar }: CollabRichTextEditorToolbarType) {
  const { editor } = useCurrentEditor()
  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false);

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
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      }
    }
    // empty
  }, [editor])


  if (!editor) {
    return null
  }

  return (
    <>
      {beforeToolbar && beforeToolbar}

      {isToolbarVisible && (
        <Box display={'flex'} gap={4} marginTop={8} className='tiptap-toolbar'>
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
            <Image src="/image/icon/bold.svg" alt="Bold" width={16} height={16} />
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
            <Image src="/image/icon/italic.svg" alt="italic" width={16} height={16} />
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
            <Image src="/image/icon/strikethrough.svg" alt="strikethrough" width={16} height={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
          >
            <Image src="/image/icon/ordered.svg" alt="ordered list" width={16} height={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
          >
            <Image src="/image/icon/unordered.svg" alt="unordered list" width={16} height={16} />
          </button>
          <div style={{ width: 1, backgroundColor: '#E5E7EB' }}></div>
          <button
            onClick={() => { }}
            className={editor.isActive('emoji') ? 'is-active' : ''}
          >
            <Image src="/image/icon/emoji.svg" alt="emoji" width={16} height={16} />
          </button>

          {extendToolbar && extendToolbar}

          <ToolbarUrl
            editor={editor}
            isOpen={isLinkMenuOpen}
            onChangeVisibility={setIsLinkMenuOpen}
            onChange={setLink}
          />

        </Box>
      )}
      {afterToolbar && afterToolbar}
    </>
  )
}