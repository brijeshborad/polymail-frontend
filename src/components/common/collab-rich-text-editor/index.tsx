import { updateKeyNavigation } from '@/redux/key-navigation/action-reducer'
import {EditorProvider, Node, useCurrentEditor} from '@tiptap/react'
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
import { TiptapCollabProvider, HocuspocusProvider } from '@hocuspocus/provider'
import { CollabRichTextEditorType } from '@/types/props-types/collab-rich-text-editor.types'
import { StateType } from '@/types'
import {useCallback, useEffect, useState} from 'react'
import ContentMonitor from './content-monitor'

export default function CollabRichTextEditor({
  id, isToolbarVisible = false, onChange, afterToolbar, extendToolbar, projectShare,
  placeholder, emailSignature, className='', content }: CollabRichTextEditorType) {
  const dispatch = useDispatch()
  const { selectedAccount } = useSelector((state: StateType) => state.accounts);
  const [provider, setProvider] = useState<any>()
  const [extensions, setExtensions] = useState<any>([]);
  const { editor } = useCurrentEditor()

  useEffect(() => {
    if (content) {
      // console.log('CONTENT', content);
      // editor?.commands.setContent(``)
    }
  }, [content, editor?.commands])

  const getSchema = useCallback(() => {
    return [
      Node.create({name: 'doc', content: 'block+'}),
      Node.create({
        addAttributes() {
          return {
            style: {default: null},
            id: {default: null},
            class: {default: null},
            href: {default: null},
          }
        },
        name: 'div',
        content: 'block+',
        code: false,
        marks: '_',
        group: 'block',
        parseHTML() {return [{ tag: 'div' }]},
        renderHTML({node}) {
          return ['div', node.attrs, 0]
        }
      }),
      Node.create({
        addAttributes() {
          return {
            style: {default: null},
            id: {default: null},
            class: {default: null},
            href: {default: null},
          }
        },
        name: 'paragraph',
        content: 'inline*',
        code: false,
        marks: '_',
        group: 'block',
        parseHTML() {return [{ tag: 'p' }]},
        renderHTML({node}) {
          return ['p', node.attrs, 0]
        }
      }),
      Node.create({
        name: 'text',
        group: 'inline',
      }),
      Node.create({
        addAttributes() {
          return {
            style: {default: null},
            id: {default: null},
            class: {default: null},
            href: {default: null},
          }
        },
        name: 'html',
        content: 'block+',
        code: false,
        marks: '_',
        group: 'block',
        parseHTML() {return [{ tag: 'html' }]},
        renderHTML({node}) {
          return ['html', node.attrs, 0]
        }
      }),
      Node.create({
        addAttributes() {
          return {
            style: {default: null},
            id: {default: null},
            class: {default: null},
            href: {default: null},
          }
        },
        name: 'body',
        content: 'block+',
        code: false,
        marks: '_',
        group: 'block',
        parseHTML() {return [{ tag: 'body' }]},
        renderHTML({node}) {
          return ['body', node.attrs, 0]
        }
      }),
      Node.create({
        addAttributes() {
          return {
            style: {default: null},
            id: {default: null},
            class: {default: null},
            href: {default: null},
            width: {default: null},
            height: {default: null},
            src: {default: null},
          }
        },
        name: 'img',
        content: 'inline*',
        code: false,
        marks: '_',
        group: 'block',
        parseHTML() {return [{ tag: 'img' }]},
        renderHTML({node}) {
          return ['img', node.attrs, 0]
        }
      })
    ]
  }, [])

  useEffect(() => {
    if(!id) return

    const prov = new HocuspocusProvider({
      url: 'ws://127.0.0.1:1234',
      name: id,
      // appId: '09XY1YK1', // get this at collab.tiptap.dev
      // name: id, // e.g. a uuid uuidv4();
      // token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2OTYyODQzNzcsIm5iZiI6MTY5NjI4NDM3NywiZXhwIjoxNjk2MzcwNzc3LCJpc3MiOiJodHRwczovL2NvbGxhYi50aXB0YXAuZGV2IiwiYXVkIjoibHVpekBwb2x5bWFpbC5jb20ifQ.BUEHslAobsvrPSivEtBe3Os7VxiYpt80iRs261zaKOg',
      // document: new Y.Doc() // pass your existing doc, or leave this out and use provider.document
    })
    setProvider(prov)

    setExtensions([
      ...getSchema(),
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
        }
      }),
      CollaborationCursor.configure({
        provider: prov,
        user: {
          name: selectedAccount ? selectedAccount.name : 'Uknown',
          color: '#f783ac',
        },
      }),
    ])
  }, [id, selectedAccount, placeholder, getSchema])



  if(!provider) return

  return (
    <div className={`tiptap-container ${className}`}>
      <EditorProvider
        onFocus={(editor) => {
          dispatch(updateKeyNavigation({ isEnabled: false }))
          // if(editor.editor.isEmpty) {
            let finalContent = '';
            if (emailSignature) {
              finalContent += emailSignature;
            }
            if (projectShare) {
              finalContent += projectShare
            }
            console.log(finalContent);
            editor.editor.commands.setContent(finalContent)
          // }
          editor.editor.commands.focus('start')
        }}
        onBlur={() => dispatch(updateKeyNavigation({ isEnabled: true }))}
        onUpdate={({ editor }) => onChange(editor.getHTML())}
        slotAfter={(
          <CollabRichTextEditorToolbar
            isToolbarVisible={isToolbarVisible}
            beforeToolbar={null}
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
