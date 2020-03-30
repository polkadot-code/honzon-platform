import { createReducer } from 'typesafe-actions';
import * as actions from './actions';
import { AccountState } from '@honzon-platform/apps/types/store';

const initialState: AccountState = {
    extensionStatus: 'none',
    accountList: [],
    account: null,
    accountStatus: 'none',
    balancas: [],
    transferStatus: 'none',
    airdrop: [],
    error: 'none',
};

export default createReducer(initialState)
    .handleAction(actions.fetchAssetsBalance.success, (state, action) => ({
        ...state,
        balancas: action.payload,
    }))
    .handleAction(actions.fetchAirdrop.success, (state, action) => ({
        ...state,
        airdrop: action.payload,
    }))
    .handleAction(actions.transfer.request, state => ({
        ...state,
        transferStatus: 'pending',
    }))
    .handleAction(actions.transfer.success, state => ({
        ...state,
        transferStatus: 'success',
    }))
    .handleAction(actions.transfer.failure, state => ({
        ...state,
        transferStatus: 'none',
    }))
    .handleAction(actions.reset, state => ({
        ...state,
        updateLoanStatus: 'none',
    }))
    .handleAction(actions.setAccount, (state, action) => ({
        ...state,
        account: action.payload,
        accountStatus: 'success',
    }))
