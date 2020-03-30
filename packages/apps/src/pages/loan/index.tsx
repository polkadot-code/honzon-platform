import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Box, makeStyles, createStyles, Theme, withStyles } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { isEmpty } from 'lodash';

import actions from '@honzon-platform/apps/store/actions';
import { COLLATERAL, STABLE_COIN, assets } from '@honzon-platform/apps/config';
import { loansSelector } from '@honzon-platform/apps/store/loan/selectors';
import useMobileMatch from '@honzon-platform/apps/hooks/mobile-match';
import { loadingSelector } from '@honzon-platform/apps/store/loading/reducer';
import { FETCH_VAULTS } from '@honzon-platform/apps/store/loan/actions';
import Page from '@honzon-platform/apps/components/page';

import PricesFeed from './components/prices-feed';
import { Active as LoanListActive, LoanList } from './components/loan-list';
import SystemInfo from './components/system-info';
import CollateralInfo from './components/collateral-info';
import LoanConsole from './components/loan-console';
import TransactionHistory from './components/transactions-history';
import LoanPanel from './components/loan-panel';
import AddLoan from './components/add-loan';
import WalletBalance from './components/account-balance';
import Guide from './components/guide';
import Overview from './components/overview';
import { useApi } from '@honzon-platform/hooks/useApi';

const Detail = withStyles((theme: Theme) => ({
    root: {
        marginTop: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
            marginTop: 0,
        },
    },
}))(Grid);

const useStyle = makeStyles((theme: Theme) =>
    createStyles({
        page: {
            [theme.breakpoints.down('lg')]: {
                maxWidth: 1200,
            },
            [theme.breakpoints.up('xl')]: {
                maxWidth: 1600,
            },
        },
        systemInfo: {
            [theme.breakpoints.down('md')]: {
                flex: '1 1 100%',
                marginTop: 32,
                marginLeft: 0,
            },
        },
        loanInfo: {
            [theme.breakpoints.down('sm')]: {
                marginTop: 32,
            },
        },
        gap: { marginBottom: theme.spacing(2) },
    }),
);

const Loan: React.FC = () => {
    const dispatch = useDispatch();
    const [active, setActive] = useState<LoanListActive>('overview');
    const prevActive = useRef<LoanListActive>(active);
    const userLoans = useSelector(loansSelector);
    const isLoadingLoan = useSelector(loadingSelector(FETCH_VAULTS));
    const classes = useStyle();
    const match = useMobileMatch('sm');
    const mdMatch = useMobileMatch('md');
    useEffect(() => {
        // fetch default constants
        dispatch(actions.chain.fetchConstants.request({}));
        // fetch user loans info
        dispatch(actions.loan.fetchLoans.request(COLLATERAL));
        // fetch user asset balance
        dispatch(actions.account.fetchAssetsBalance.request(Array.from(assets.keys())));
        // fetch tokens total issuance
        dispatch(actions.chain.fetchTotalIssuance.request([STABLE_COIN]));
        // fetch system loans info
        dispatch(actions.chain.fetchCdpTypes.request(COLLATERAL));

        dispatch(actions.chain.fetchPricesFeed.request(Array.from(assets.keys())));
        // load tx record
        dispatch(actions.loan.loadTxRecord());
    }, [dispatch]);

    const showAddLoan = () => {
        prevActive.current = active;
        setActive('add_loan');
    };
    const hideAddLoan = (backToProvious = true) => {
        backToProvious && setActive(prevActive.current);
    };
    const showOverview = () => {
        prevActive.current = active;
        setActive('overview');
    };
    const handleLoanSelect = (asset: number) => {
        prevActive.current = active;
        setActive(asset);
    };
    const handleAddLoanSuccess = (asset: number) => {
        // if add loan successed, don't save add_loan to prevAction
        setActive(asset);
        hideAddLoan(false);
    };

    const renderContent = () => {
        if (typeof isLoadingLoan !== 'boolean') {
            return null;
        }
        if (isLoadingLoan === true) {
            return <Skeleton variant="rect" width="100%" height={500} />;
        }
        if (active === 'add_loan') {
            return <AddLoan onCancel={hideAddLoan} onSuccess={handleAddLoanSuccess} />;
        }
        if (isEmpty(userLoans)) {
            return <Guide onConfirm={showAddLoan} />;
        }
        if (active === 'overview') {
            return <Overview onSelect={handleLoanSelect} />;
        }
        return (
            <>
                <LoanPanel current={active} />
                <Box paddingTop={match ? 4 : 2} />
                <LoanConsole current={active} />
                <Box paddingTop={match ? 4 : 2} />
                <TransactionHistory current={active} />
            </>
        );
    };

    return (
        <Page className={classes.page}>
            <Grid container direction={match ? 'column' : 'row'}>
                <LoanList active={active} onOverview={showOverview} onAdd={showAddLoan} onSelect={handleLoanSelect} />
            </Grid>
            <Detail spacing={2} container direction={match ? 'column' : 'row'} wrap={mdMatch ? 'wrap' : 'nowrap'}>
                <Grid item md={12} lg={8} xl={9} className={classes.loanInfo}>
                    {renderContent()}
                </Grid>
                <Grid item md={12} lg={4} xl={3} className={classes.systemInfo}>
                    <WalletBalance className={classes.gap} />
                    <PricesFeed className={classes.gap} />
                    <SystemInfo className={classes.gap} />
                    <CollateralInfo current={typeof active === 'number' ? active : -1} className={classes.gap} />
                </Grid>
            </Detail>
        </Page>
    );
};

export default Loan;
