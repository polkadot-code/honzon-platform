import { get } from 'lodash';
import { Epic } from 'redux-observable';
import { filter, map, switchMap, withLatestFrom, first, exhaustMap, mergeMap, startWith } from 'rxjs/operators';
import { combineLatest, of, empty, interval } from 'rxjs';
import { isActionOf, RootAction, RootState } from 'typesafe-actions';

import { u8aToNumber } from '@honzon-platform/apps/utils';
import * as actions from './actions';
import FixedU128 from '@honzon-platform/apps/utils/fixed_u128';

export const fetchPricesFeedEpic: Epic<RootAction, RootAction, RootState> = (action$, state$) =>
    action$.pipe(
        filter(isActionOf(actions.fetchPricesFeed.request)),
        withLatestFrom(state$),
        switchMap(([action, state]) => {
            const assetList = action.payload;
            const app = state.chain.app!;
            // FIXME: use a concrete type once polkadotjs fixes inconsistency.
            return interval(1000 * 60).pipe(
                startWith(0),
                switchMap(() => {
                    return combineLatest(
                        assetList.map(asset => {
                            // read aUSD price form consts module
                            if (asset === 1) {
                                return of(app.consts.prices.stableCurrencyFixedPrice);
                            }
                            return (app.rpc as any).oracle.getValue(asset);
                        }),
                    ).pipe(
                        map(result => {
                            return assetList.map((asset, index) => {
                                const price =
                                    asset === 1
                                        ? get(result, [index], { isNone: true })
                                        : get(result, [index, 'value', 'value'], { isNone: true });
                                return {
                                    asset,
                                    price: FixedU128.fromParts(u8aToNumber(price)),
                                };
                            });
                        }),
                        map(actions.fetchPricesFeed.success),
                    );
                }),
            );
        }),
    );

export const fetchCdpTypesEpic: Epic<RootAction, RootAction, RootState> = (action$, state$) =>
    action$.pipe(
        filter(isActionOf(actions.fetchCdpTypes.request)),
        withLatestFrom(state$),
        exhaustMap(params => {
            const [action, state] = params;
            return state.chain.constants
                ? of([action, state] as typeof params)
                : /* eslint-disable */
                state$.pipe(
                    mergeMap(state => {
                        return state.chain.constants ? of([action, state] as typeof params) : empty();
                    }),
                    first(),
                );
            /* eslint-enable */
        }),
        switchMap(([action, state]) => {
            const assetList = action.payload;
            const app = state.chain.app;
            return combineLatest(
                assetList.map(asset =>
                    combineLatest([
                        app!.query.cdpEngine.debitExchangeRate(asset),
                        app!.query.cdpEngine.liquidationPenalty(asset),
                        app!.query.cdpEngine.liquidationRatio(asset),
                        app!.query.cdpEngine.maximumTotalDebitValue(asset),
                        app!.query.cdpEngine.requiredCollateralRatio(asset),
                        app!.query.cdpEngine.stabilityFee(asset),
                    ]),
                ),
            ).pipe(
                map(result => {
                    return assetList.map((asset, index) => ({
                        asset,
                        debitExchangeRate: result[index][0].isEmpty
                            ? state.chain.constants!.cdpEngine.defaultDebitExchangeRate
                            : FixedU128.fromParts(u8aToNumber(result[index][0])),
                        liquidationPenalty: FixedU128.fromParts(u8aToNumber(result[index][1])),
                        liquidationRatio: FixedU128.fromParts(u8aToNumber(result[index][2])),
                        maximumTotalDebitValue: FixedU128.fromParts(u8aToNumber(result[index][3])),
                        requiredCollateralRatio: FixedU128.fromParts(u8aToNumber(result[index][4])),
                        /* eslint-disable */
                        stabilityFee: result[index][5].isEmpty
                            ? state.chain.constants!.cdpEngine.globalStabilityFee
                            : state.chain.constants!.cdpEngine.globalStabilityFee.add(
                                FixedU128.fromParts(u8aToNumber(result[index][5])),
                            ),
                        /* eslint-enable */
                    }));
                }),
                map(actions.fetchCdpTypes.success),
            );
        }),
    );

export const fetchTotalIssuance: Epic<RootAction, RootAction, RootState> = (action$, state$) =>
    action$.pipe(
        filter(isActionOf(actions.fetchTotalIssuance.request)),
        withLatestFrom(state$),
        switchMap(([action, state]) => {
            const assetList = action.payload;
            const app = state.chain.app;
            return combineLatest(assetList.map(asset => app!.query.tokens.totalIssuance(asset))).pipe(
                map(result =>
                    assetList.map((asset, index) => {
                        return {
                            asset,
                            issuance: FixedU128.fromParts(u8aToNumber(result[index])),
                        };
                    }),
                ),
                map(actions.fetchTotalIssuance.success),
            );
        }),
    );

export const fetchConstants: Epic<RootAction, RootAction, RootState> = (action$, state$) =>
    action$.pipe(
        filter(isActionOf(actions.fetchConstants.request)),
        withLatestFrom(state$),
        map(([action, state]) => {
            const app = state.chain.app!;
            return {
                cdpEngine: {
                    collateralCurrencyIds: app.consts.cdpEngine.collateralCurrencyIds,
                    defaultDebitExchangeRate: app.consts.cdpEngine.defaultDebitExchangeRate,
                    defaultLiquidationRatio: app.consts.cdpEngine.defaultLiquidationRatio,
                    stableCurrencyId: app.consts.cdpEngine.getStableCurrencyId,
                    globalStabilityFee: app.consts.cdpEngine.globalStabilityFee,
                    maxSlippageSwapWithDex: app.consts.cdpEngine.maxSlippageSwapWithDex,
                    minimumDebitValue: app.consts.cdpEngine.minimumDebitValue,
                },
                babe: {
                    expectedBlockTime: app.consts.babe.expectedBlockTime,
                },
            };
        }),
        map(result => {
            const { cdpEngine, babe } = result;
            return {
                cdpEngine: {
                    collateralCurrencyIds: (cdpEngine.collateralCurrencyIds.toJSON() as any) as string[],
                    defaultDebitExchangeRate: FixedU128.fromParts(cdpEngine.defaultLiquidationRatio.toString()),
                    defaultLiquidationRatio: FixedU128.fromParts(cdpEngine.defaultLiquidationRatio.toString()),
                    stableCurrencyId: cdpEngine.stableCurrencyId.toString(),
                    globalStabilityFee: FixedU128.fromParts(cdpEngine.globalStabilityFee.toString()),
                    maxSlippageSwapWithDex: FixedU128.fromParts(cdpEngine.maxSlippageSwapWithDex.toString()),
                    minimumDebitValue: FixedU128.fromParts(cdpEngine.minimumDebitValue.toString()),
                },
                babe: {
                    expectedBlockTime: babe.expectedBlockTime.toNumber(),
                },
            };
        }),
        map(result => actions.fetchConstants.success(result)),
    );
