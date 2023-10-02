import { Event, StateType } from "@/types";
import { useCurrentEditor } from "@tiptap/react";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function ContentMonitor() {
  const { event } = useSelector((state: StateType) => state.globalEvents) as { event: Event };
  const { editor } = useCurrentEditor()

  useEffect(() => {
    if (event.type === 'richtexteditor.forceUpdate') {
      console.log('UPDATE EDITOR', event.data)
      editor?.commands.setContent(event.data)
    }


  }, [event, editor?.commands]);

  return (
    <></>
  )
}