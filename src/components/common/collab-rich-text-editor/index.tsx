import {updateKeyNavigation} from '@/redux/key-navigation/action-reducer'
import {EditorProvider, Node, useCurrentEditor, mergeAttributes} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useDispatch, useSelector} from 'react-redux'
import CollabRichTextEditorToolbar from './toolbar'
import {Color} from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import {TiptapCollabProvider, HocuspocusProvider} from '@hocuspocus/provider'
import {CollabRichTextEditorType} from '@/types/props-types/collab-rich-text-editor.types'
import {StateType} from '@/types'
import {useCallback, useEffect, useState} from 'react'
import ContentMonitor from './content-monitor'

export default function CollabRichTextEditor({
                                                 id,
                                                 isToolbarVisible = false,
                                                 onChange,
                                                 afterToolbar,
                                                 extendToolbar,
                                                 projectShare,
                                                 placeholder,
                                                 emailSignature,
                                                 className = ''
                                             }: CollabRichTextEditorType) {
    const dispatch = useDispatch()
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const [provider, setProvider] = useState<any>()
    const [extensions, setExtensions] = useState<any>([]);
    const getSchema = useCallback(() => {
        return [
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
                name: 'div',
                content: 'block+',
                code: false,
                marks: '_',
                group: 'block',
                parseHTML() {
                    return [{tag: 'div'}]
                },
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
                        width: {default: null},
                        height: {default: null},
                        src: {default: null},
                        border: {default: null},
                        alt: {default: null},
                    }
                },
                inline: true,
                content: 'inline*',
                code: false,
                marks: '_',
                group: 'image',
                name: 'image',
                parseHTML() {
                    return [{tag: 'img'}]
                },
                renderHTML({node}) {
                    return ['img', node.attrs, 0]
                }
            }),
            Node.create({
                addAttributes() {
                    return {
                        style: {default: null},
                        id: {default: null},
                        class: {default: null}
                    }
                },
                name: 'paragraph',
                content: '(inline|image?)*',
                code: false,
                marks: '_',
                group: 'block',
                parseHTML() {
                    return [{tag: 'p'}]
                },
                renderHTML({node, HTMLAttributes}) {
                    let style = node.attrs.style;
                    if (style) {
                        style += ' margin-block-start: 1em; margin-block-end: 1em;';
                    } else {
                        style = ' margin-block-start: 1em; margin-block-end: 1em;';
                    }
                    return ['p', mergeAttributes(HTMLAttributes, node.attrs, {style}), 0]
                }
            }),
            Node.create({
                name: 'table',
                group: 'block',
                content: 'tableRow+',
                tableRole: 'table',
                isolating: true,
                addAttributes() {
                    return {
                        style: {default: null},
                        id: {default: null},
                        class: {default: null},
                        width: {default: null},
                        height: {default: null},
                        border: {default: null}
                    }
                },
                code: false,
                marks: '_',
                parseHTML() {
                    return [{tag: 'table'}]
                },
                renderHTML({node}) {
                    console.log('-DONE IT RENDER HERE', node);
                    return ['table', node.attrs, ['tbody', 0]]
                }
            }),
            Node.create({
                name: 'tableRow',
                content: '(tableCell | tableHeader)*',
                tableRole: 'row',
                parseHTML() {return [{ tag: 'tr' }]},
                renderHTML({ HTMLAttributes, node }) {
                    return ['tr', mergeAttributes(HTMLAttributes, node.attrs), 0]
                },
            }),
            Node.create({
                name: 'tableHeader',
                content: 'block+',
                addAttributes() {
                    return {
                        style: {default: null},
                        id: {default: null},
                        class: {default: null},
                        colspan: {default: 1},
                        rowspan: {default: 1},
                        colwidth: {
                            default: null,
                            parseHTML: element => {
                                const colwidth = element.getAttribute('colwidth')
                                const value = colwidth
                                    ? [parseInt(colwidth, 10)]
                                    : null

                                return value
                            },
                        },
                    }
                },
                tableRole: 'header_cell',
                isolating: true,
                parseHTML() {return [{ tag: 'th' }]},
                renderHTML({ HTMLAttributes, node }) {
                    return ['th', mergeAttributes(HTMLAttributes, node.attrs), 0]
                },
            }),
            Node.create({
                name: 'tableCell',
                content: 'block+',
                addAttributes() {
                    return {
                        style: {default: null},
                        id: {default: null},
                        class: {default: null},
                        colspan: {default: 1},
                        rowspan: {default: 1},
                        colwidth: {
                            default: null,
                            parseHTML: element => {
                                const colwidth = element.getAttribute('colwidth')
                                const value = colwidth
                                    ? [parseInt(colwidth, 10)]
                                    : null

                                return value
                            },
                        },
                    }
                },
                tableRole: 'cell',
                isolating: true,
                parseHTML() {return [{ tag: 'td' }]},
                renderHTML({ HTMLAttributes, node }) {
                    return ['td', mergeAttributes(HTMLAttributes, node.attrs), 0]
                },
            }),
            Node.create({
                name: 'doc',
                group: 'block+',
            }),
        ]
    }, [])

    useEffect(() => {
        if (!id) return

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
            Color.configure({types: [TextStyle.name, ListItem.name]}),
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
                        editor.editor.commands.setContent(finalContent)
                    }
                    editor.editor.commands.focus('start')
                }}
                onBlur={() => dispatch(updateKeyNavigation({isEnabled: true}))}
                onUpdate={({editor}) => null} // onChange(editor.getHTML())
                slotAfter={(
                    <CollabRichTextEditorToolbar
                        isToolbarVisible={isToolbarVisible}
                        beforeToolbar={null}
                        afterToolbar={afterToolbar}
                        extendToolbar={extendToolbar}
                    />
                )}
                extensions={extensions}>
                <ContentMonitor/>
            </EditorProvider>
        </div>
    )
}
