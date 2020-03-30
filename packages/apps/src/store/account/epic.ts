import { Epic } from 'redux-observable';
import {
    filter,
    map,
    switchMap,
    withLatestFrom,
    catchError,
    flatMap,
    takeUntil,
} from 'rxjs/operators';
import { combineLatest, of, concat } from 'rxjs';
import { isActionOf, RootAction, RootState } from 'typesafe-actions';
import { u8aToNumber } from '@honzon-platform/apps/utils';
import FixedU128 from '@honzon-platform/apps/utils/fixed_u128';
import { AssetList } from '@honzon-platform/apps/types/store';
import * as appActions from '../app/actions';
import { Tx } from '@honzon-platform/apps/types/store';
import { txLog$, txResultFilter$ } from '@honzon-platform/apps/utils/epic';
import { startLoading, endLoading } from '../loading/reducer';
import * as actions from './actions';
import { AccountInfo } from '@polkadot/types/interfaces';

export const fetchAssetBalanceEpic: Epic<RootAction, RootAction, RootState> = (action$, state$) =>
    action$.pipe(
        filter(isActionOf(actions.fetchAssetsBalance.request)),
        withLatestFrom(state$),
        filter(([_, state]) => state.chain.app !== null),
        filter(([_, state]) => state.account.account !== null),
        switchMap(([action, state]) => {
            const data = action.payload as AssetList;
            const app = state.chain.app;
            const account = state.account.account!.address;
            return combineLatest(
                data.map(asset => {
                    if (asset === 0) {
                        return app!.query.system.account(account);
                    }
                    return app!.query.tokens.balance(asset, account);
                }),
            ).pipe(
                map(result => {
                    return data.map((asset, index) => {
                        if (asset === 0) {
                            return {
                                asset,
                                balance: FixedU128.fromParts(
                                    u8aToNumber(((result[index] as unknown) as AccountInfo).data.free),
                                ),
                            };
                        }
                        return {
                            asset,
                            balance: FixedU128.fromParts(u8aToNumber(result[index])),
                        };
                    });
                }),
                map(actions.fetchAssetsBalance.success),
            );
        }),
    );
export const transferEpic: Epic<RootAction, RootAction, RootState> = (action$, state$) =>
    action$.pipe(
        filter(isActionOf(actions.transfer.request)),
        withLatestFrom(state$),
        switchMap(([action, state]) => {
            const data = action.payload;
            const app = state.chain.app!;
            const address = state.account.account!.address;

            const tx = app.tx.currencies.transfer(data.account, data.asset, data.amount.innerToString());
            const txRecord: Tx = {
                id: tx.hash.toString(),
                signer: address,
                hash: '',
                status: 'pending',
                time: new Date().getTime(),
                type: 'transfer',
                data: data,
            };

            return concat(
                of(startLoading(actions.TRANSFER)),
                of(appActions.updateTransition(txRecord)),
                tx.signAndSend(address).pipe(
                    txLog$,
                    txResultFilter$,
                    flatMap(result => {
                        return of(
                            appActions.updateTransition({
                                ...txRecord,
                                hash: tx.hash.toHex(), // get hash when ExtrinsicSuccess occured
                                time: new Date().getTime(),
                                status: 'success',
                            }),
                            actions.transfer.success(result),
                        );
                    }),
                    catchError((error: Error) =>
                        of(
                            appActions.updateTransition({
                                ...txRecord,
                                hash: tx.hash.toHex(), // get hash when ExtrinsicSuccess occured
                                time: new Date().getTime(),
                                status: 'failure',
                            }),
                            actions.transfer.failure(error.message),
                        ),
                    ),
                    takeUntil(action$.ofType(actions.transfer.success, actions.transfer.failure)),
                ),
                of(endLoading(actions.TRANSFER)),
            );
        }),
    );

export const fetchAirdropEpic: Epic<RootAction, RootAction, RootState> = (action$, state$) =>
    action$.pipe(
        filter(isActionOf(actions.fetchAirdrop.request)),
        withLatestFrom(state$),
        filter(([_, state]) => state.chain.app !== null),
        filter(([_, state]) => state.account.account !== null),
        switchMap(([action, state]) => {
            const data = action.payload as AssetList;
            const app = state.chain.app;
            const account = state.account.account!.address;
            return combineLatest(
                data.map(asset => {
                    return app!.query.airDrop.airDrops(account, asset);
                }),
            ).pipe(
                map(result => {
                    return data.map((asset, index) => ({
                        asset,
                        balance: FixedU128.fromParts(u8aToNumber(result[index])),
                    }));
                }),
                map(actions.fetchAirdrop.success),
            );
        }),
    );