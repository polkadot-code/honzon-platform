import { createReducer } from 'typesafe-actions';
import * as actions from './actions';
import { ChainState } from '@honzon-platform/apps/types/store';

const initialState: ChainState = {
    app: null,
    connected: false,
    pricesFeed: [],
    cdpTypes: [],
    totalIssuance: [],
    constants: null,
};

export default createReducer(initialState)
    .handleAction(actions.setAPI, (state, action) => {
        return {
            ...state,
            app: action.payload,
        };
    })
    .handleAction(actions.fetchCdpTypes.success, (state, action) => ({
        ...state,
        cdpTypes: action.payload,
    }))
    .handleAction(actions.fetchTotalIssuance.success, (state, action) => ({
        ...state,
        totalIssuance: action.payload,
    }))
    .handleAction(actions.fetchConstants.success, (state, action) => {
        return {
            ...state,
            constants: action.payload,
        };
    });
