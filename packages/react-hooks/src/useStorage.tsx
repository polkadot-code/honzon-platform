import { useRef } from "react";
import { useAccounts } from "./useAccounts";
import { useIsAppReady } from "./useIsAppReady";

interface Options {
    customPrefix: string;
    useAccountPrefix?: boolean;
    useCustomPrefix?: boolean;
}

const getPrefixKey = (key: string, options: Options & { address: string } ) => {
    if (options.useAccountPrefix) {
        return `${options.address}_${key}`;
    }
    if (options.useCustomPrefix) {
        return `${options.customPrefix}_${key}`;
    }
    return key;
};

export const useStorage = (
    key: string,
    options: Options = { useAccountPrefix: true, customPrefix: '', useCustomPrefix: false }
) => {
    const isReady = useIsAppReady();
    const { activeAccount } = useAccounts();
    const checkUseable: () => boolean = () => {
        if (!isReady) {
            console.error(`useStorage: storage manipulate may occur error if app is not ready. key: ${key}`);
            return false;
        }
        if (options.useAccountPrefix && !!activeAccount) {
            console.error(`useStorage: storage manipulate may occur error if active account is not ready. key: ${key}`);
            return false;
        }
        return true;
    };
    const set = (value: string) => {
        if (checkUseable()) {
            const _key = getPrefixKey(key, { ...options, address: activeAccount!.address });
            window.localStorage.setItem(_key, value);
            return true;
        }
        return false;
    }
    const get = () => {
        if (checkUseable()) {
            const _key = getPrefixKey(key, { ...options, address: activeAccount!.address });
            return window.localStorage.getItem(_key);
        }
        return null;
    }
    return [set, get];
}