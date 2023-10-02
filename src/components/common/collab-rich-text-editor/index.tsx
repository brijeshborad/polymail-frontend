import { updateKeyNavigation } from '@/redux/key-navigation/action-reducer'
import { EditorProvider } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useDispatch, useSelector } from 'react-redux'
import CollabRichTextEditorToolbar from './toolbar'
import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { TiptapCollabProvider } from '@hocuspocus/provider'
import { CollabRichTextEditorType } from '@/types/props-types/collab-rich-text-editor.types'
import { StateType } from '@/types'
import { useEffect, useState } from 'react'
import ContentMonitor from './content-monitor'

export default function CollabRichTextEditor({
  id, isToolbarVisible = false, onChange,
  beforeToolbar, afterToolbar, extendToolbar,
  placeholder, className='' }: CollabRichTextEditorType) {
  const dispatch = useDispatch()
  const { selectedAccount } = useSelector((state: StateType) => state.accounts);
  const [provider, setProvider] = useState<any>()
  const [extensions, setExtensions] = useState<any>([])

  useEffect(() => {
    if(!id) return 
    
    const prov = new TiptapCollabProvider({
      appId: '09XY1YK1', // get this at collab.tiptap.dev
      name: id, // e.g. a uuid uuidv4();
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2OTYwMTI5NDMsIm5iZiI6MTY5NjAxMjk0MywiZXhwIjoxNjk2MDk5MzQzLCJpc3MiOiJodHRwczovL2NvbGxhYi50aXB0YXAuZGV2IiwiYXVkIjoibHVpekBwb2x5bWFpbC5jb20ifQ.eiAUVv-nW6rD-l8YeitTZn2SVgzacDRDaSkYegie800',
      // document: new Y.Doc() // pass your existing doc, or leave this out and use provider.document
    })
    setProvider(prov)

    setExtensions([
      Collaboration.configure({
        document: prov.document,
      }),
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
      CollaborationCursor.configure({
        provider: prov,
        user: {
          name: selectedAccount ? selectedAccount.name : 'Uknown',
          color: '#f783ac',
        },
      }),
    ])
  }, [id, selectedAccount, placeholder])



  if(!provider) return

  return (
    <div className={`tiptap-container ${className}`}>
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
      >
        <ContentMonitor />
      </EditorProvider>
    </div>
  )
}