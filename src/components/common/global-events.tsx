import { useEffect } from "react";
import KeyboardNavigationListener from "./keyboard-navigation";
import { useDispatch } from "react-redux";
import { fireEvent } from "@/redux/global-events/action-reducer";

export default function GlobalEvents() {
  const dispatch = useDispatch()

  useEffect(() => {
    const handleWindowBlur = () => {
      if(document.activeElement?.tagName === 'IFRAME') {
        dispatch(fireEvent({
          event: 'iframe.clicked',
        }))

        setTimeout(() => {
          dispatch(fireEvent({
            event: 'idle',
          }))
        }, 50)
      }
    }
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [dispatch])

  return (
    <KeyboardNavigationListener />
  )
}