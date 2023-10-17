import {EditorProvider} from '@tiptap/react'
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
import {getSchema} from "@/utils/editor-common-functions";
import {keyNavigationService} from "@/services";
import {getProjectBanner} from "@/utils/common.functions";

export default function CollabRichTextEditor({
                                                 id,
                                                 isAutoFocus = false,
                                                 isToolbarVisible = false,
                                                 onCreate,
                                                 afterToolbar,
                                                 extendToolbar,
                                                 placeholder,
                                                 onFocus,
                                                 emailSignature, projectShare,
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

        const prov = new HocuspocusProvider({
            url: `${process.env.NEXT_PUBLIC_COLLAB_WEBSOCKET_URL}`,
            name: id
        })
        console.log('___COLLABID____', id, prov);
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
                        } else {
                            let finalContent = '';
                            if (emailSignature) {
                                finalContent += `<p></p>` + emailSignature;
                            }
                            if (projectShare) {
                                finalContent += `<p></p>` + projectShare
                            }
                            if (!projectShare && isComposing && project) {
                                finalContent += getProjectBanner(selectedAccount)
                            }

                            editor.editor.commands.setContent(finalContent.trim(), false)
                            editor.editor.commands.focus('start')
                        }
                    }
                }}
                onUpdate={({editor}) => onChange(editor.getHTML())}
                slotAfter={<CollabRichTextEditorToolbar
                    beforeToolbar={null}
                    isVisible={isToolbarVisible}
                    afterToolbar={afterToolbar}
                    extendToolbar={extendToolbar}
                />}
                onBlur={() => {
                    keyNavigationService.toggleKeyNavigation(true);
                }}
                extensions={extensions}>
                <ContentMonitor/>
            </EditorProvider>
        </div>
    )
}
