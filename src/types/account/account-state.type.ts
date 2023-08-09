import {Account} from "@/models";

export declare type InitialAccountStateType = {
    accounts?: Account[],
    account?: Account | null,
    isLoading?: boolean
    error?: Error | any,
    selectedAccount?: Account | null,
    success?: boolean,
}
