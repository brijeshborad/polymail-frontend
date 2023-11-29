import {EditorProvider, useCurrentEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useSelector} from 'react-redux'
import CollabRichTextEditorToolbar from './toolbar'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Highlight from '@tiptap/extension-highlight'
import {HocuspocusProvider} from '@hocuspocus/provider'
import {CollabRichTextEditorType} from '@/types/props-types/collab-rich-text-editor.types'
import {StateType} from '@/types'
import {useEffect, useState} from 'react'
import ContentMonitor from './content-monitor'
import {getPlainTextFromHtml, getSchema} from "@/utils/editor-common-functions";
import {keyNavigationService} from "@/services";
import {getProjectBanner} from "@/utils/common.functions";

export default function CollabRichTextEditor({
                                                 id,
                                                 isAutoFocus = false,
                                                 isToolbarVisible = false,
                                                 // onCreate,
                                                 content,
                                                 afterToolbar,
                                                 extendToolbar,
                                                 placeholder,
                                                 emailSignature, projectShare,
                                                 className = '',
                                                 onChange, isCompose
                                             }: CollabRichTextEditorType) {
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {isComposing} = useSelector((state: StateType) => state.commonApis);
    const {project} = useSelector((state: StateType) => state.projects);
    const [provider, setProvider] = useState<any>()
    const [extensions, setExtensions] = useState<any>([]);
    const [documentId, setDocumentId] = useState<string | null>(null);
    const {editor} = useCurrentEditor()

    useEffect(() => {
        if (id) {
            if (documentId !== id) {
                if (editor) {
                    editor.commands.clearContent(false);
                }
                if (provider) {
                    setProvider(null);
                }
                setDocumentId(id);
            }
        }
    }, [documentId, editor, id, provider]);

    useEffect(() => {
        if (!documentId) return
        const prov = new HocuspocusProvider({
            url: `${process.env.NEXT_PUBLIC_COLLAB_WEBSOCKET_URL}`,
            name: documentId,
            preserveConnection: false
        })
        console.log('___COLLABID____', documentId, prov);
        setProvider(prov)

        setExtensions([
            ...getSchema,
            Collaboration.configure({
                document: prov.document
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
                }
            }),
            Highlight.configure({
                HTMLAttributes: {
                    class: 'highlight',
                },
                multicolor: true
            })
        ])
    }, [documentId, selectedAccount, placeholder])

    function setContent(editor: any) {
        if (!getPlainTextFromHtml(content || '').trim()) {
            let finalContent = '';
            if (emailSignature) {
                finalContent += emailSignature;
            }
            if (projectShare) {
                finalContent += projectShare
            }
            if (!projectShare && isComposing && project) {
                finalContent += getProjectBanner(selectedAccount)
            }
            editor.commands.setContent(finalContent.trim(), false)
            onChange(finalContent.trim());
        }
        if (isAutoFocus) {
            editor.commands.focus('start')
        }
    }

    if (!provider) return;

    return (
        <div className={`tiptap-container ${className}`}>
            <EditorProvider
                autofocus={isAutoFocus}
                onFocus={() => {
                    keyNavigationService.toggleKeyNavigation(false)
                }}
                onCreate={({editor}) => {
                    if (editor.isEmpty) {
                        setContent(editor);
                    }
                }}
                onUpdate={({editor}) => onChange(editor.getHTML())}
                slotAfter={<CollabRichTextEditorToolbar
                    beforeToolbar={null}
                    isVisible={isToolbarVisible}
                    afterToolbar={afterToolbar}
                    extendToolbar={extendToolbar}
                />}
                onSelectionUpdate={({editor}) => {
                    if (!isCompose) {
                        const {from, to} = editor.state.selection;
                        editor.chain().focus().setTextSelection({from, to}).run()
                    }
                }}
                onBlur={() => {
                    keyNavigationService.toggleKeyNavigation(true);
                }}
                extensions={extensions}>
                <ContentMonitor provider={provider}/>
            </EditorProvider>
        </div>
    )
}
