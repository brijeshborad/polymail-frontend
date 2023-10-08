import {BaseService} from "@/services/base.service";
import {updateAccountState} from "@/redux/accounts/action-reducer";
import {InitialAccountStateType} from "@/types";
import {Account} from "@/models";

export class AccountService extends BaseService {

    constructor() {
        super();
    }

    setSelectedAccount(account: Account | null) {
        this.setAccountState({selectedAccount: account});
    }

    setAccounts(accounts: Account[]) {
        this.setAccountState({accounts: accounts});
    }

    setAccountState(stateBody: InitialAccountStateType) {
        this.dispatchAction(updateAccountState, stateBody);
    }

}

export const accountService = new AccountService();
