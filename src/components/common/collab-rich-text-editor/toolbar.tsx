import { Box } from "@chakra-ui/react"
import { useCurrentEditor } from "@tiptap/react"
import Image from "next/image"
import { useCallback } from "react"

export default function CollabRichTextEditorToolbar() {
  const { editor } = useCurrentEditor()

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink()
        .run()

      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url })
      .run()
  }, [editor])


  if (!editor) {
    return null
  }

  return (
    <Box display={'flex'} gap={4} className='tiptap-toolbar'>
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
        onClick={setLink}
        className={editor.isActive('emoji') ? 'is-active' : ''}
      >
        <Image src="/image/icon/emoji.svg" alt="emoji" width={16} height={16} />
      </button>
      <button
        onClick={setLink}
        className={editor.isActive('link') ? 'is-active' : ''}
      >
        <Image src="/image/icon/link.svg" alt="Link" width={16} height={16} />
      </button>
    </Box>
  )
}