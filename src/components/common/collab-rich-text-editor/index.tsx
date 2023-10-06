import {updateKeyNavigation} from '@/redux/key-navigation/action-reducer'
import {EditorProvider} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useDispatch, useSelector} from 'react-redux'
import CollabRichTextEditorToolbar from './toolbar'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import {TiptapCollabProvider} from '@hocuspocus/provider'
import {CollabRichTextEditorType} from '@/types/props-types/collab-rich-text-editor.types'
import FileHandler from '@tiptap-pro/extension-file-handler'
import {StateType} from '@/types'
import {useEffect, useState} from 'react'
import ContentMonitor from './content-monitor'
import {getSchema} from "@/utils/editor-common-functions";

export default function CollabRichTextEditor({
                                                 id,
                                                 isAutoFocus=false,
                                                 isToolbarVisible = false,
                                                 onCreate,
                                                 onFileDrop,
                                                 afterToolbar,
                                                 extendToolbar,
                                                 placeholder,
                                                 emailSignature,
                                                 projectShare,
                                                 className = ''
                                             }: CollabRichTextEditorType) {
    const dispatch = useDispatch()
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const [provider, setProvider] = useState<any>()
    const [extensions, setExtensions] = useState<any>([]);

    useEffect(() => {
        if (!id) return

        const prov = new TiptapCollabProvider({
            appId: process.env.NEXT_PUBLIC_TIPTAP_APP_ID!, // get this at collab.tiptap.dev
            name: id, // e.g. a uuid uuidv4();
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2OTY2MTIxMzMsIm5iZiI6MTY5NjYxMjEzMywiZXhwIjoxNjk2Njk4NTMzLCJpc3MiOiJodHRwczovL2NvbGxhYi50aXB0YXAuZGV2IiwiYXVkIjoibHVpekBwb2x5bWFpbC5jb20ifQ.zprEOwgG-82Vo_c8HeDxpCtNpmi-5AJHyEuUYDWRHV0',
            // document: new Y.Doc() // pass your existing doc, or leave this out and use provider.document
        })
        setProvider(prov)

        setExtensions([
            ...getSchema,
            Collaboration.configure({
                document: prov.document,
            }),
            Placeholder.configure({
                placeholder: placeholder,
            }),
            Link.configure({
                openOnClick: true,
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
            FileHandler.configure({
              onDrop: (editor, files) => {
                onFileDrop(files);
              },
            })
        ])
    }, [id, selectedAccount, placeholder])


    if (!provider) return

    return (
        <div className={`tiptap-container ${className}`}>
            <EditorProvider
                autofocus={isAutoFocus}
                onCreate={onCreate}
                onFocus={(editor) => {
                    dispatch(updateKeyNavigation({isEnabled: false}))
                    if (editor.editor.isEmpty) {
                        let finalContent = '';
                        if (emailSignature) {
                            finalContent += `<p></p>` + emailSignature;
                        }
                        if (projectShare) {
                            finalContent += `<p></p>` + projectShare
                        }

                        editor.editor.commands.setContent(finalContent.trim(), false)
                        editor.editor.commands.focus('start')
                    }
                }}
                slotAfter={isToolbarVisible && (
                  <CollabRichTextEditorToolbar
                      beforeToolbar={null}
                      afterToolbar={afterToolbar}
                      extendToolbar={extendToolbar}
                    />
                )}
                onBlur={() => {
                  dispatch(updateKeyNavigation({isEnabled: true}))
                }}
                extensions={extensions}>
                <ContentMonitor />
            </EditorProvider>
        </div>
    )
}
