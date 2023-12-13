import styles from "@/styles/Inbox.module.css";
import React, {useCallback, useEffect, useState} from "react";
import {LinkPreviewProps} from "@/types/props-types/link-preview.types";
import LinkPreview from "@/components/common/link-preview";
import {globalEventService} from "@/services";

export default function IframeLoader({body}: { body: string }) {
    const iframeRef = React.useRef<any | null>(null);
    const [iframeHeight, setIframeHeight] = useState<string>('');
    const [currentLinkPreview, setCurrentLinkPreview] = useState<LinkPreviewProps>({
        isVisible: false,
        url: null,
        top: 0,
        left: 0
    })
    const [blobUrl, setBlobUrl] = useState<string>('');

    // Set iframe height once content is loaded within iframe
    const loadHeightInstantly = useCallback(() => {
        if (iframeHeight !== '') {
            return;
        }
        if (iframeRef.current && iframeRef.current.contentWindow && iframeRef.current.contentWindow.document && iframeRef.current.contentWindow.document.body) {
            setIframeHeight((iframeRef.current.contentWindow.document.body.scrollHeight + 40) + "px");

            iframeRef.current.contentDocument.body.style.fontFamily = "'Inter', sans-serif";
            iframeRef.current.contentDocument.body.style.fontSize = "14px";
            const allLinks = iframeRef.current.contentDocument.getElementsByTagName("a")

            const iframeKeyDown = (e: KeyboardEvent | any) => {
                globalEventService.fireEventWithDelay({type: 'iframe.keyDown', data: e})
            }

            const iframeKeyUp = () => {
                globalEventService.fireEventWithDelay('iframe.keyUp')
            }
            iframeRef.current.contentDocument.body.addEventListener('keydown', iframeKeyDown)
            iframeRef.current.contentDocument.body.addEventListener('keyup', iframeKeyUp)

            for (let i in allLinks) {
                const a = allLinks[i]
                if (typeof a === 'object' && a.hasAttribute('href')) {
                    const href = a.getAttribute('href')
                    a.onmouseover = function () {
                        setCurrentLinkPreview({
                            isVisible: true,
                            url: href,
                            top: a.getBoundingClientRect().top + window.scrollY,
                            left: a.getBoundingClientRect().left + window.scrollX
                        })
                    }
                    a.onmouseout = function () {
                        setCurrentLinkPreview({
                            isVisible: false,
                            url: href,
                            top: -100,
                            left: -100
                        })
                    }
                }
            }
        } else {
            setTimeout(() => {
                loadHeightInstantly();
            }, 100);
        }
    }, [iframeHeight])

    useEffect(() => {
        if (blobUrl !== body) {
            setBlobUrl(body);
            setIframeHeight('');
        }
    }, [body, blobUrl])

    useEffect(() => {
        if (blobUrl) {
            setTimeout(() => {
                loadHeightInstantly();
            }, 100);
        }
    }, [blobUrl, loadHeightInstantly]);

    return (
        <>
            {blobUrl && <>
                <iframe
                    ref={ref => iframeRef.current = ref}
                    scrolling="no"
                    height={iframeHeight || '0px'}
                    src={blobUrl}
                    className={styles.mailBody}
                />
                <LinkPreview
                    isVisible={currentLinkPreview.isVisible}
                    url={currentLinkPreview?.url}
                    top={currentLinkPreview.top}
                    left={currentLinkPreview.left}
                />
            </>}
        </>
    )
}
