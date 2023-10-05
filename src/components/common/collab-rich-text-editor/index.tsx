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
import {StateType} from '@/types'
import {useEffect, useState} from 'react'
import ContentMonitor from './content-monitor'
import {getSchema} from "@/utils/editor-common-functions";

export default function CollabRichTextEditor({
                                                 id,
                                                 isToolbarVisible = false,
                                                 onChange,
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
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2OTY0NDM1NzAsIm5iZiI6MTY5NjQ0MzU3MCwiZXhwIjoxNjk2NTI5OTcwLCJpc3MiOiJodHRwczovL2NvbGxhYi50aXB0YXAuZGV2IiwiYXVkIjoibHVpekBwb2x5bWFpbC5jb20ifQ.pm5towD49TWNkWf3OTqFthYp-7zZBPaqRUZU8P4JDu4',
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
        ])
    }, [id, selectedAccount, placeholder])


    if (!provider) return

    return (
        <div className={`tiptap-container ${className}`}>
            <EditorProvider
                onFocus={(editor) => {
                    dispatch(updateKeyNavigation({isEnabled: false}))
                    if (editor.editor.isEmpty) {
                        let finalContent = '';
                        if (emailSignature) {
                            finalContent += emailSignature;
                        }
                        if (projectShare) {
                            finalContent += projectShare
                        }
                        editor.editor.commands.setContent(finalContent, false)
                    }
                    editor.editor.commands.focus('start')
                }}
                onBlur={() => dispatch(updateKeyNavigation({isEnabled: true}))}
                onUpdate={({editor}) => onChange(editor.getHTML())}
                extensions={extensions}>
                <ContentMonitor/>
                <CollabRichTextEditorToolbar
                    isToolbarVisible={isToolbarVisible}
                    beforeToolbar={null}
                    afterToolbar={afterToolbar}
                    extendToolbar={extendToolbar}
                />
            </EditorProvider>
        </div>
    )
}
