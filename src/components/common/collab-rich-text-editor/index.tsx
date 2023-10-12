import {EditorProvider} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useSelector} from 'react-redux'
import CollabRichTextEditorToolbar from './toolbar'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Highlight from '@tiptap/extension-highlight'
import {TiptapCollabProvider} from '@hocuspocus/provider'
import {CollabRichTextEditorType} from '@/types/props-types/collab-rich-text-editor.types'
import {StateType} from '@/types'
import {useEffect, useState} from 'react'
import ContentMonitor from './content-monitor'
import {getSchema} from "@/utils/editor-common-functions";
import {keyNavigationService} from "@/services";

export default function CollabRichTextEditor({
                                                 id,
                                                 isAutoFocus = false,
                                                 isToolbarVisible = false,
                                                 onCreate,
                                                 afterToolbar,
                                                 extendToolbar,
                                                 placeholder,
                                                 onFocus,
                                                 className = '',
                                                 onChange
                                             }: CollabRichTextEditorType) {
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const [provider, setProvider] = useState<any>()
    const [extensions, setExtensions] = useState<any>([]);

    useEffect(() => {
        if (!id) return

        const prov = new TiptapCollabProvider({
            appId: process.env.NEXT_PUBLIC_TIPTAP_APP_ID!, // get this at collab.tiptap.dev
            name: id, // e.g. a uuid uuidv4();
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2OTcwNDU2OTAsIm5iZiI6MTY5NzA0NTY5MCwiZXhwIjoxNjk3MTMyMDkwLCJpc3MiOiJodHRwczovL2NvbGxhYi50aXB0YXAuZGV2IiwiYXVkIjoibHVpekBwb2x5bWFpbC5jb20ifQ.T_10hLjqkUHyyGYqpaj7LYgUOzaP8T74Uxsdy8Z1HSY',
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
            Highlight.configure({
                HTMLAttributes: {
                    class: 'highlight',
                },
                multicolor: true
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
                    keyNavigationService.toggleKeyNavigation(false);
                    if (editor.editor.isEmpty) {
                        if (onFocus) {
                            onFocus();
                        }
                    }
                }}
                onUpdate={({editor}) => onChange(editor.getHTML())}
                slotAfter={isToolbarVisible && (
                    <CollabRichTextEditorToolbar
                        beforeToolbar={null}
                        afterToolbar={afterToolbar}
                        extendToolbar={extendToolbar}
                    />
                )}
                onBlur={() => {
                    keyNavigationService.toggleKeyNavigation(true);
                }}
                extensions={extensions}>
                <ContentMonitor/>
            </EditorProvider>
        </div>
    )
}
