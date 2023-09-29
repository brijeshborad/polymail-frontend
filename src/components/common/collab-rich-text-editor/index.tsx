import { updateKeyNavigation } from '@/redux/key-navigation/action-reducer'
import { EditorProvider } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useDispatch } from 'react-redux'
import CollabRichTextEditorToolbar from './toolbar'
import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
// import Collaboration from '@tiptap/extension-collaboration'
// import { HocuspocusProvider } from '@hocuspocus/provider'
import { CollabRichTextEditorType } from '@/types/props-types/collab-rich-text-editor.types'

export default function CollabRichTextEditor({
  content = '', isToolbarVisible = false, onChange,
  beforeToolbar, afterToolbar, extendToolbar,
  placeholder }: CollabRichTextEditorType) {
  const dispatch = useDispatch()

  // const provider = new HocuspocusProvider({
  //   url: 'ws://127.0.0.1:1234',
  //   name: 'example-document',
  // })

  const extensions = [
    // Collaboration.configure({
    //   document: provider.document,
    // }),
    Placeholder.configure({
      placeholder: placeholder,
    }),
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    // TextStyle.configure({ types: [ListItem.name] }),
    Link.configure({
      openOnClick: false,
      linkOnPaste: true
    }),
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
      },
    }),
  ]



  return (
    <div>
      <EditorProvider
        onFocus={() => dispatch(updateKeyNavigation({ isEnabled: false }))}
        onBlur={() => dispatch(updateKeyNavigation({ isEnabled: true }))}
        onUpdate={({ editor }) => onChange(editor.getHTML())}
        slotAfter={(
          <CollabRichTextEditorToolbar
            isToolbarVisible={isToolbarVisible}
            beforeToolbar={beforeToolbar}
            afterToolbar={afterToolbar}
            extendToolbar={extendToolbar}
          />
        )}
        extensions={extensions}
        content={content}
      >
      </EditorProvider>
    </div>
  )
}