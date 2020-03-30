import React, { ReactNode, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles, createStyles } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';
import Loading from '@honzon-platform/apps/components/loading';
import actions from '@honzon-platform/apps/store/actions';
import { sideBarConfig } from '@honzon-platform/apps/config';
import { SelectAccount } from '@honzon-platform/apps/components/select-account';
import useMobileMatch from '@honzon-platform/apps/hooks/mobile-match';
import TxStatus from '@honzon-platform/apps/components/tx-status';
import { useEnvironment } from '@honzon-platform/hooks/useEnvironment';
import { NetWorkError } from './components/network-error';
import { useAccounts } from '@honzon-platform/hooks/useAccounts';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import Header from './components/header';
import Sidebar from './components/side-bar';
import NoExtension from './components/no-extension';
import NoAccount from './components/no-account';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            height: '100%',
            width: '100%',
            background: theme.palette.background.default,
            [theme.breakpoints.down('sm')]: {
                flexDirection: 'column',
            },
        },
        content: {
            flexGrow: 1,
        },
        toolbar: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 1),
            ...theme.mixins.toolbar,
        },
    }),
);

interface Props {
    children: ReactNode;
}

const MainLayout: React.FC<Props> = props => {
    const { children } = props;
    const dispatch = useDispatch();
    const classes = useStyles();
    const [test, setTest] = useState<boolean>(false);
    const { error: networkError, loading, connected, api } = useEnvironment();
    const {
        ready: accountsReady,
        extensionError,
        accountError,
        activeAccount,
        setActiveAccount,
        accounts,
    } = useAccounts();
    const match = useMobileMatch('sm');

    useEffect(() => {
        if (connected) {
            dispatch(actions.chain.setAPI(api));
            setTest(true);
        }
    }, [api, connected]);

    const handleAccountSelect = (account: InjectedAccountWithMeta) => {
        setActiveAccount(account.address, api);
        dispatch(actions.account.setAccount(account));
    };

    const renderContent = () => {
        if (extensionError) {
            return <NoExtension open={true} />;
        }
        if (accountError) {
            return <NoAccount open={true} />;
        }
        if (!activeAccount) {
            return <SelectAccount open={true} accounts={accounts} onSelect={handleAccountSelect} />;
        }
        if (connected && activeAccount) {
            return <div className={classes.content}>{children}</div>;
        }
    };

    if (networkError) {
        return <NetWorkError open={networkError} />;
    }

    if (!connected || loading) {
        return <Loading />;
    }

    return (
        <div className={classes.root}>
            {match ? <Header /> : <Sidebar config={sideBarConfig} />}
            {renderContent()}
            <TxStatus />
        </div>
    );
};

export default MainLayout;
