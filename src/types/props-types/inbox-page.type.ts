import {Thread} from "@/models";

export declare type InboxTabProps = {
    content: Thread[],
    handleClick: (val: string) => void;
    tab: string,
    showLoader: boolean
}

export declare type MailTabProps = {
    show: (val: boolean) => void;
    id?: string,
}

export declare type MailsTabProps = {
    show: (val: boolean) => void;
    handleContent: (val: string) => void;
}
