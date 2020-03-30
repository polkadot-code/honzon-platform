import React from 'react';
import { Typography, List, ListItem, Grid } from '@material-ui/core';
import { useTranslate } from '@honzon-platform/apps/hooks/i18n';
import Card from '@honzon-platform/apps/components/card';
import { useSelector } from 'react-redux';
import Formatter from '@honzon-platform/apps/components/formatter';
import { balancesSelector } from '@honzon-platform/apps/store/account/selectors';
import { getAssetName } from '@honzon-platform/apps/utils';
import FixedU128 from '@honzon-platform/apps/utils/fixed_u128';
import { withStyles } from '@material-ui/styles';
import { BaseProps } from '@honzon-platform/apps/types/react-component/props';
import { useCall } from '@honzon-platform/hooks/useCall';
import { currentPrices } from '@honzon-platform/api-deriver/price';
import { pricesConvertor } from '@honzon-platform/apps/convertor/prices';
import { useApi } from '@honzon-platform/hooks/useApi';
import { balance, accountBalances } from '@honzon-platform/api-deriver/account';
import { useAccounts } from '@honzon-platform/hooks/useAccounts';

const Number = withStyles(() => ({
    root: { textAlign: 'right' },
}))(Typography);

const WalletBalance: React.FC<BaseProps> = ({ className, style }) => {
    const { t } = useTranslate();
    const api = useApi();
    const { activeAccount } = useAccounts();
    const { data: prices } = useCall<ReturnType<typeof pricesConvertor>>(
        currentPrices(api) as any,
        { formatter: pricesConvertor }
    );

    return null;
    // return (
    //     <Card
    //         size="normal"
    //         elevation={1}
    //         header={<Typography variant="subtitle1">{t('Wallet Balance')}</Typography>}
    //         className={className}
    //         style={style}
    //     >
    //         <List disablePadding>
    //             {balances.map(item => {
    //                 const price = prices!.find(price => price.asset === item.asset);
    //                 return (
    //                     <ListItem disableGutters key={`wallet-balance-${item.asset}`}>
    //                         <Grid container justify="space-between">
    //                             <Grid item xs={3}>
    //                                 <Typography variant="body2">{getAssetName(item.asset)}</Typography>
    //                             </Grid>
    //                             <Grid item xs={3}>
    //                                 <Number variant="body2">
    //                                     <Formatter type="balance" data={item.balance} />
    //                                 </Number>
    //                             </Grid>
    //                             <Grid item xs={3}>
    //                                 <Number variant="body2">
    //                                     <Formatter
    //                                         type="price"
    //                                         data={item.balance.mul(price ? price.price : FixedU128.fromNatural(0))}
    //                                         prefix="$"
    //                                     />
    //                                 </Number>
    //                             </Grid>
    //                         </Grid>
    //                     </ListItem>
    //                 );
    //             })}
    //         </List>
    //     </Card>
    // );
};

export default WalletBalance;
