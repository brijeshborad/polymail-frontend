import {useEffect} from "react";
import KeyboardNavigationListener from "./keyboard-navigation";
import {useDispatch} from "react-redux";
import {globalEventService} from "@/services/global-event.service";

export default function GlobalEvents() {
    const dispatch = useDispatch()

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
    }, [dispatch])

    return (
        <KeyboardNavigationListener/>
    )
}
