import { useState, useEffect } from "react";
import { get, noop } from 'lodash';
import { useEnvironment } from "./useEnvironment";
import { useAccounts } from "./useAccounts";

interface Options {
    onSuccess?: () => void;
    onError?: () => void;
}
/**
 * @name useIsAppReady
 * @description check app status, return true when chain connected and has active account, in ohter case return false.
 */
export const useIsAppReady = (options?: Options) => {
    const [appReadyStatus, setAppReadyStatus] = useState<boolean>(false);
    const { connected } = useEnvironment();
    const { activeAccount } = useAccounts();
    
    useEffect(() => {
        const status = connected && !!activeAccount && !!activeAccount.address;
        // handle onSuccess or onError callback
        (status ? get(options, 'onSuccess', noop) : get(options, 'onError', noop))();
        setAppReadyStatus(status);
    }, [connected, activeAccount])

    return { appReadyStatus };
}