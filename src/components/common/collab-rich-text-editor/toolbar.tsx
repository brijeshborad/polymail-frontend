import { Box, Button, FormControl, FormLabel, Input, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger } from "@chakra-ui/react"
import { useCurrentEditor } from "@tiptap/react"
import Image from "next/image"
import { useCallback, useState } from "react"

export default function CollabRichTextEditorToolbar() {
  const [linkUrl, setLinkUrl] = useState('')
  const { editor } = useCurrentEditor()
  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false);

  const setLink = useCallback((url?: string) => {
    if(!editor) return
    const previousUrl = editor.getAttributes('link').href
    
    if(!url) {
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
      if(url) {
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      }
    }
    // empty
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
        onClick={() => { }}
        className={editor.isActive('emoji') ? 'is-active' : ''}
      >
        <Image src="/image/icon/emoji.svg" alt="emoji" width={16} height={16} />
      </button>
      <Popover
        isOpen={isLinkMenuOpen}
        onClose={() => {
          setIsLinkMenuOpen(false)
          setLinkUrl('')
        }}
      >
        <PopoverTrigger>
          <button
            onClick={() => {
              setIsLinkMenuOpen(!isLinkMenuOpen)
              setLinkUrl(editor.getAttributes('link').href)
            }}
            className={editor.isActive('link') ? 'is-active' : ''}
          >
            <Image src="/image/icon/link.svg" alt="Link" width={16} height={16} />
          </button>
        </PopoverTrigger>
        <PopoverContent width={250}>
          <PopoverArrow />
          <PopoverBody padding={4}>
            <Box display={'flex'} flexDirection={'column'} gap={4}>
              <FormControl>
                <FormLabel fontSize={13} fontWeight={'semibold'}>Url</FormLabel>
                <Input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </FormControl>
              <Box display={'flex'} gap={2}>
                <Button
                  width={'auto'}
                  backgroundColor={'#000'}
                  border={'1px solid #000'}
                  color={'#fff'}
                  fontSize={13}
                  paddingX={8} paddingY={4}
                  className='button'
                  onClick={() => setLink(linkUrl)}
                >
                  Add
                </Button>
                <Button
                  width={'auto'}
                  backgroundColor={'#fff'}
                  border={'1px solid #000'}
                  color={'#000'}
                  fontSize={13}
                  paddingX={8} paddingY={4}
                  className='button'
                  onClick={() => {
                    setIsLinkMenuOpen(false)
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  )
}