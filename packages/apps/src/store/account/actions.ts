import { createAsyncAction, createAction } from 'typesafe-actions';
import { AssetList, BalanceData, TransferData } from '@honzon-platform/apps/types/store';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

export const setAccount = createAction('@account/set_account', (action) => {
    return (account: InjectedAccountWithMeta) => action(account);
});
export const FETCH_ASSETS_BALANCE = '@account/fetch_assets_balance';
export const fetchAssetsBalance = createAsyncAction(
    FETCH_ASSETS_BALANCE,
    '@account/fetch_assets_balance/success',
    '@account/fetch_assets_balance/failure',
)<AssetList, BalanceData[], string>();

export const FETCH_AIRDROP = '@account/fetch_airdrop';
export const fetchAirdrop = createAsyncAction(
    FETCH_AIRDROP,
    '@account/fetch_airdrop/success',
    '@account/fetch_airdrop/failure',
)<AssetList, BalanceData[], string>();

export const TRANSFER = '@account/transfer';
export const transfer = createAsyncAction(TRANSFER, '@account/transfer/success', '@account/transfer/failure')<
    TransferData,
    any,
    string
>();

export const reset = createAction('@loan/reset');
