import {useEffect} from "react";
import KeyboardNavigationListener from "./keyboard-navigation";
import {globalEventService} from "@/services";
import Notification from "./notification";

export default function GlobalEvents() {
    useEffect(() => {
        const handleWindowBlur = () => {
            if (document.activeElement?.tagName === 'IFRAME') {
                globalEventService.fireEvent('iframe.clicked')
                setTimeout(() => {
                    globalEventService.fireEvent('idle')
                }, 50)
            }
        }
        window.addEventListener('blur', handleWindowBlur);
        return () => {
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, [])

    return (
        <>
            <Notification/>
            <KeyboardNavigationListener/>
        </>
    )
}
