import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    DialogActions,
    Slide,
    List,
    ListItem,
    ListItemText,
} from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions';
import { useTranslate } from '@honzon-platform/apps/hooks/i18n';
import { withStyles } from '@material-ui/styles';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

const Transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const SList = withStyles(() => ({
    root: {
        marginBottom: 10
    }
}))(List);
interface Props {
    open: boolean;
    accounts: InjectedAccountWithMeta[];
    onSelect: (account: InjectedAccountWithMeta) => void;
}
export const SelectAccount: React.FC<Props> = ({ open, accounts, onSelect }) => {
    const { t } = useTranslate();
    const [selected, setSelected] = useState<number>(0);

    const confirmHandler = () => {
        onSelect(accounts[selected]);
    };

    const selectHandlerGen = (index: number) => () => setSelected(index);

    return (
        <Dialog open={open} TransitionComponent={Transition}>
            <DialogTitle>{t('Select Account')}</DialogTitle>
            <DialogContent>
                <SList disablePadding>
                    {accounts.map((account, index) => (
                        <ListItem
                            disableGutters
                            button
                            onClick={selectHandlerGen(index)}
                            selected={index === selected}
                            key={`account-${account.address}`}
                        >
                            <ListItemText primary={account.meta.name} secondary={account.address}/>
                        </ListItem>
                    ))}
                </SList>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" onClick={confirmHandler}>
                    {t('Confirm')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
