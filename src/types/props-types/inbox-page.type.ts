import {Thread} from "@/models";

export declare type InboxTabProps = {
    content: Thread[],
    handleClick: (val: Thread) => void;
    tab: string,
    showLoader: boolean
}

export declare type MailTabProps = {
    show: (val: boolean) => void;
    thread?: Thread,
    compose: boolean,
    setCompose: boolean
}

export declare type MailsTabProps = {
    show: (val: boolean) => void;
    handleContent: (val: Thread) => void;
    showCompose: (val: boolean) => void;
}
