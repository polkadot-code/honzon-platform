import { useState, useEffect } from "react";
import {
    web3Enable,
    web3Accounts,
    web3FromAddress
} from "@polkadot/extension-dapp";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { ApiRx } from "@polkadot/api";
import { defer, Observable, Subject } from "rxjs";
import { shareReplay } from "rxjs/operators";

// account manager
class Account {
    public accountSubject: Subject<InjectedAccountWithMeta>;
    public activeAccount$: Observable<InjectedAccountWithMeta>;
    public accounts$: Observable<InjectedAccountWithMeta[]>;

    constructor(title: string) {
        this.accounts$ = defer(async () => {
            const injected = await web3Enable(title);
            if (!injected.length) {
                throw new Error("extension error");
            }
            const accounts = await web3Accounts();
            return accounts;
        }).pipe(shareReplay());
        this.accountSubject = new Subject<InjectedAccountWithMeta>();
        this.activeAccount$ = this.accountSubject.pipe(shareReplay());
    }

    setActiveAccount(account: InjectedAccountWithMeta) {
        this.accountSubject.next(account);
    }
}
// account manager instance
const account = new Account();

/**
 * @name useAccounts
 * @description useAccounts hook will get accounts information from @polkadot/extension
 */
export const useAccounts = () => {
    const [activeAccount, _setActiveAccount] = useState<InjectedAccountWithMeta>();
    const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
    const [extensionError, setExtensionError] = useState<boolean>(false);
    const [accountError, setAccountError] = useState<boolean>(false);
    const [ready, setReady] = useState<boolean>(false);
    // set active account
    const setActiveAccount = async (address: string, api: ApiRx) => {
        const data = accounts.find(account => account.address === address);
        if (!data) {
            setAccountError(true);
        } else {
            const injector = await web3FromAddress(data.address);
            api.setSigner(injector.signer);
            window.localStorage.setItem("default_account", data.address);
            account.setActiveAccount(data);
        }
    };
    const readLocalAccount = async (api: ApiRx) => {
        const defaultAddress = window.localStorage.getItem("default_account");
        if (defaultAddress) {
            setActiveAccount(defaultAddress, api);
        }
    };
    const loadAccounts = async () => {
        const accountsSubscription = account.accounts$.subscribe(
            accounts => {
                setAccounts(accounts);
                setReady(true);
            },
            () => {
                setExtensionError(true);
            }
        );
        // subscribe new active account
        const activeAccountSubscription = account.activeAccount$.subscribe((account) => {
            _setActiveAccount(account);
        });

        return () => {
            accountsSubscription.unsubscribe();
            activeAccountSubscription.unsubscribe();
        }
    };
    // read account from extension
    useEffect(() => {
        loadAccounts();
    }, []);

    return {
        ready,
        accounts,
        activeAccount,
        setActiveAccount,
        readLocalAccount,
        extensionError,
        accountError
    };
};
