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
                                                 emailSignature,
                                                 projectShare,
                                                 className = '',
                                                 onChange
                                             }: CollabRichTextEditorType) {
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {isComposing} = useSelector((state: StateType) => state.commonApis);
    const {project} = useSelector((state: StateType) => state.projects);
    const [provider, setProvider] = useState<any>()
    const [extensions, setExtensions] = useState<any>([]);

    useEffect(() => {
        if (!id) return

        const prov = new TiptapCollabProvider({
            appId: process.env.NEXT_PUBLIC_TIPTAP_APP_ID!, // get this at collab.tiptap.dev
            name: id, // e.g. a uuid uuidv4();
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2OTY2MDc5NzQsIm5iZiI6MTY5NjYwNzk3NCwiZXhwIjoxNjk2Njk0Mzc0LCJpc3MiOiJodHRwczovL2NvbGxhYi50aXB0YXAuZGV2IiwiYXVkIjoibHVpekBwb2x5bWFpbC5jb20ifQ.Fc26DC4XUqr-ds7wD44iAUF4vrCm7H1pqqW5HNUmjA8',
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
                        let finalContent = '';
                        if (emailSignature) {
                            finalContent += `<p></p>` + emailSignature;
                        }
                        if (projectShare) {
                            finalContent += `<p></p>` + projectShare
                        }
                        if (!projectShare && isComposing && project) {
                            finalContent += `<p></p><div style="display: flex; background-color: #EBF83E; width: fit-content; border-radius: 4px; color: #0A101D font-weight: 500; line-height: 1; padding: 5px 10px">
                                <p style="font-size: 13px; margin-right: 3px;"> ${selectedAccount?.name || ''} is sharing this email thread (and future replies) with</p>
                                <p style="font-size: 13px; text-decoration: underline; margin-right: 3px;">others</p>
                                <p style="font-size: 13px; margin-right: 3px;">on</p>
                                <p style="font-size: 13px; text-decoration: underline">Polymail</p>
                              </div>`
                        }

                        editor.editor.commands.setContent(finalContent.trim(), false)
                        editor.editor.commands.focus('start')
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
