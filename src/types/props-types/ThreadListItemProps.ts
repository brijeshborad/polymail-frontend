import {Thread} from "@/models";

export declare type ThreadListItemProps = {
  tab: string,
  thread: Thread,
  onClick: (_e: any) => void
  onSelect: (_ref: any) => void
}