import {useCallback, useEffect, useRef, useState} from "react";
import dynamic from 'next/dynamic'

const Editor = dynamic(
    () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
    {ssr: false}
)
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {RichTextEditorProps, StateType} from "@/types";
import {
    EditorState,
    convertToRaw,
    ContentState,
} from 'draft-js';
import draftToHtml from "draftjs-to-html";
import {emojiArray} from "@/utils/common.functions";
import { useSelector } from "react-redux";

let htmlToDraft: any = null;
if (typeof window === 'object') {
    htmlToDraft = require('html-to-draftjs').default;
}

export function RichTextEditor({onChange, placeholder, className, value, hideToolBar}: RichTextEditorProps) {
  const containerRef: any = useRef(null)
  const { event: incomingEvent } = useSelector((state: StateType) => state.globalEvents);
  const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
    const [isContentEdited, setIsContentEdited] = useState<boolean>(false);
    const [editorRef, setEditorRef] = useState<any | null>(null);
    const updateParentComponent = useCallback(() => {
        if (onChange && isContentEdited) { // editorState?.getCurrentContent().getPlainText().trim()
            onChange(draftToHtml(convertToRaw(editorState?.getCurrentContent() as ContentState)));
        }
        // eslint-disable-next-line
    }, [editorState])

    const setEditorReference = (ref: any) => {
        if (!editorRef) {
            setEditorRef(ref);
        }
    }

    useEffect(() => {
        if (editorRef) {
            if (editorRef.addEventListener) {
                editorRef.addEventListener('keyup', () => {
                    if (!isContentEdited) {
                        setIsContentEdited(true);
                    }
                })
            }
        }
    }, [editorRef, isContentEdited])

    useEffect(() => {
        updateParentComponent();
    }, [updateParentComponent])

    useEffect(() => {
        if (value && !isContentEdited) {
            let finalHtmlValue = htmlToDraft(decodeURIComponent(value));
            setEditorState(EditorState.moveSelectionToEnd(EditorState.createWithContent(ContentState.createFromBlockArray(finalHtmlValue))));
        }
    }, [value, isContentEdited])

    const closeEditorDropDowns = () => {
      const emojiWrapper = (containerRef && containerRef.current) ? containerRef.current.getElementsByClassName('rdw-emoji-wrapper') : null
      if (emojiWrapper && emojiWrapper[0]) {
        const emojiButton = emojiWrapper[0].getElementsByClassName('rdw-option-wrapper')[0]
        const isEmojiModalOpen = emojiWrapper[0].getElementsByClassName('emoji-picker')[0]

        if(isEmojiModalOpen) {
          if(emojiButton) emojiButton.click()
        }
      }

      const linkWrapper = (containerRef && containerRef.current) ? containerRef.current.getElementsByClassName('rdw-link-wrapper') : null
      if (linkWrapper && linkWrapper[0]) {
        const linkButton = linkWrapper[0].getElementsByClassName('rdw-option-wrapper')[0]
        const isLinkModalOpen = linkWrapper[0].getElementsByClassName('emoji-picker')[0]

        if(isLinkModalOpen) {
          if(linkButton) linkButton.click()
        }
      }
    }

    useEffect(() => {
      if (incomingEvent === 'iframe.clicked') {
        closeEditorDropDowns()
      }
    }, [incomingEvent])

    /**
     * Detects clicks outside of the component and closes it (if open)
     */
    useEffect(() => {
      function handleClickOutside(event: any) {
        const current:any = containerRef.current

        if (current && !current.contains(event.target)) {
          closeEditorDropDowns()
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [containerRef]);


    return (
      <div ref={containerRef}>
        <Editor
            placeholder={placeholder}
            editorState={editorState}
            wrapperClassName={className}
            editorRef={setEditorReference}
            editorClassName={'default-editor-css'}
            onEditorStateChange={setEditorState}
            toolbarHidden={hideToolBar ? hideToolBar : false}
            toolbar={{
                options: ['inline', 'list', 'emoji', 'link'],
                inline: {
                    inDropdown: false,
                    options: ['bold', 'italic', 'strikethrough'],
                    bold: {icon: "/image/icon/bold.svg"},
                    italic: {icon: "/image/icon/italic.svg"},
                    strikethrough: {icon: "/image/icon/strikethrough.svg"},
                },
                list: {
                    inDropdown: false,
                    options: ['ordered', 'unordered'],
                    unordered: {icon: "/image/icon/unordered.svg"},
                    ordered: {icon: "/image/icon/ordered.svg"},
                },
                emoji: {
                    // component: EmojiMenu,
                    icon: "/image/icon/emoji.svg",
                    popupClassName: 'emoji-picker',
                    emojis: emojiArray
                },

                link: {
                    inDropdown: false,
                    className: 'link-class',
                    component: undefined,
                    popupClassName: 'emoji-picker',
                    dropdownClassName: undefined,
                    showOpenOptionOnHover: true,
                    defaultTargetOption: '_self',
                    options: ['link'],
                    link: {icon: "/image/icon/link.svg", className: undefined},
                },
            }}
        />
      </div>
    )
}
