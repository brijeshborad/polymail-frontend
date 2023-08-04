import {Message} from "@/models";

export declare type InitialMessageStateType = {
    messages: Message[],
    message: Message | null,
    isLoading: boolean
    error: Error | any
}


